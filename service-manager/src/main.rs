use std::{
    collections::HashMap,
    sync::{mpsc::Sender, Arc},
};

use async_trait::async_trait;

use clap::{command, Parser};
use serde::Deserialize;
use tokio::{
    fs::read_to_string,
    process, signal,
    sync::{oneshot, Mutex},
};

use anyhow::{anyhow, bail, Result};
use log::{debug, warn};
use tonic::{Request, Response, Status};

mod proto {
    tonic::include_proto!("has.servicemanager");
}

#[derive(Debug, Eq, PartialEq)]
enum ServiceEventStatus {
    Start,
    Killed,
}

#[derive(Debug)]
struct ServiceEvent {
    service_id: String,
    status: ServiceEventStatus,
}

#[derive(Debug)]
struct Service {
    id: String,
    program: String,
    default_args: Vec<String>,
    last_args: Vec<String>,
    kill: Arc<Mutex<Option<oneshot::Sender<()>>>>,
    on_change: Option<Sender<ServiceEvent>>,
    allow_args_override: bool,
}

impl Service {
    async fn new(
        service_id: &str,
        program: &str,
        default_args: Vec<String>,
        allow_args_override: bool,
        default_start: bool,
        on_change: Option<Sender<ServiceEvent>>,
    ) -> Result<Self> {
        let mut service = Self {
            id: service_id.to_string(),
            program: program.to_string(),
            last_args: default_args.clone(),
            default_args,
            allow_args_override,
            kill: Arc::new(Mutex::new(None)),
            on_change,
        };

        if default_start {
            service.start(None).await?;
        }

        Ok(service)
    }

    async fn start(&mut self, override_args: Option<Vec<String>>) -> Result<()> {
        debug!("Starting {}", self.id);

        if !self.allow_args_override && override_args.is_some() {
            bail!("Override args was disallowed.");
        }

        if self.running().await {
            if let Err(e) = self.stop().await {
                warn!("Failed to kill before start {:?}", e)
            }
        }

        self.last_args = match &override_args {
            Some(args) => args.clone(),
            None => self.default_args.clone(),
        };

        let mut process = process::Command::new(&self.program)
            .args(&self.last_args)
            .spawn()
            .map_err(|e| anyhow!("Failed to start by {:?}", e))?;

        self.on_change(ServiceEventStatus::Start).await;

        let (send, recv) = oneshot::channel::<()>();

        let on_change = self.on_change.clone();

        let service_id = self.id.clone();

        let kill = self.kill.clone();

        *self.kill.lock().await = Some(send);

        tokio::spawn(async move {
            tokio::select! {
                _ = process.wait() => {
                    debug!("Somehow {} exited.", service_id);
                    *kill.lock().await = None
                },
                _ = recv => {
                    debug!("Killing {}", service_id);
                    if let Err(e) = process.kill().await {warn!("Failed to kill due to {:?}", e)}
                    debug!("Killed {}", service_id);
                }
            }

            if let Some(on_change) = on_change {
                if let Err(e) = on_change.send(ServiceEvent {
                    service_id,
                    status: ServiceEventStatus::Killed,
                }) {
                    warn!("Failed to propagation change {:?}", e);
                }
            }
        });

        Ok(())
    }

    async fn stop(&mut self) -> Result<()> {
        if let Some(kill) = self.kill.lock().await.take() {
            kill.send(())
                .map_err(|e| anyhow!("Failed to kill request {:?}", e))?;
        } else {
            bail!("Process not found");
        }

        Ok(())
    }

    async fn running(&mut self) -> bool {
        self.kill.lock().await.is_some()
    }

    async fn on_change(&mut self, status: ServiceEventStatus) {
        let event = ServiceEvent {
            service_id: self.id.clone(),
            status,
        };

        if let Some(on_change) = &self.on_change {
            if let Err(error) = on_change.send(event) {
                warn!("Failed to promote change ({:?})", error);
            }
        }
    }
}

struct ServiceManager {
    service: HashMap<String, Service>,
}

impl ServiceManager {
    fn new() -> Self {
        Self {
            service: HashMap::new(),
        }
    }

    async fn add(
        &mut self,
        id: &str,
        program: &str,
        arg: Vec<String>,
        allow_args_override: bool,
        default_start: bool,
    ) -> Result<()> {
        if self.service.contains_key(id) {
            bail!("Service {} already exists", id);
        }

        debug!("Service {} registered!", id);

        self.service.insert(
            id.to_string(),
            Service::new(&id, program, arg, allow_args_override, default_start, None)
                .await
                .unwrap(),
        );

        Ok(())
    }

    async fn start(&mut self, id: &str, args: Option<Vec<String>>) -> Result<()> {
        self.service
            .get_mut(id)
            .ok_or_else(|| anyhow!("Failed to find service {}", id))?
            .start(args)
            .await
    }

    async fn stop(&mut self, id: &str) -> Result<()> {
        self.service
            .get_mut(id)
            .ok_or_else(|| anyhow!("Failed to find service {}", id))?
            .stop()
            .await
    }

    async fn status(&mut self) -> Result<Vec<(String, String, Vec<String>)>> {
        // Fixme Return type
        let mut services = Vec::new();
        for (id, service) in &mut self.service {
            services.push((
                id.to_string(),
                if service.running().await {
                    "running".to_string()
                } else {
                    "not-running".to_string()
                },
                service.last_args.clone(),
            ));
        }

        Ok(services)
    }
}

#[async_trait]
impl proto::service_manager_server::ServiceManager for Arc<Mutex<ServiceManager>> {
    async fn start(
        &self,
        request: Request<proto::StartRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let args = if request.get_ref().override_args {
            Some(request.get_ref().args.clone())
        } else {
            None
        };

        self.lock()
            .await
            .start(&request.get_ref().id, args)
            .await
            .map_err(|e| Status::internal(format!("{:?}", e)))?;

        Ok(Response::new(proto::CommandReply {}))
    }

    async fn stop(
        &self,
        request: Request<proto::ServiceSpecificRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        self.lock()
            .await
            .stop(&request.get_ref().id)
            .await
            .map_err(|e| Status::internal(format!("{:?}", e)))?;

        Ok(Response::new(proto::CommandReply {}))
    }

    async fn status(
        &self,
        request: Request<proto::StatusRequest>,
    ) -> Result<Response<proto::StatusReply>, Status> {
        let services = self
            .lock()
            .await
            .status()
            .await
            .map_err(|e| Status::internal(format!("{:?}", e)))?
            .into_iter()
            .map(|(id, state, args)| proto::Service { id, state, args })
            .collect();
        Ok(Response::new(proto::StatusReply { services }))
    }
}

#[derive(Deserialize, Debug)]
struct ServiceConfig {
    program: String,
    default_args: Vec<String>,
    default_start: Option<bool>,
    allow_args_override: Option<bool>,
}

#[derive(Deserialize, Debug)]
struct ServerConfig {
    service_manager_addr: String,
}

#[derive(Deserialize, Debug)]
struct Config {
    services: HashMap<String, ServiceConfig>,
    server: ServerConfig,
}

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Args {
    #[arg(long)]
    config: String,
}

#[tokio::main]
async fn main() {
    env_logger::init();

    let args = Args::parse();

    let config_string = read_to_string(args.config)
        .await
        .unwrap_or_else(|error| panic!("Failed to load config! {:?}", error));

    let config = serde_json::from_str::<Config>(&config_string)
        .unwrap_or_else(|error| panic!("Invalid config data! {:?}", error));

    let mut service = Arc::new(Mutex::new(ServiceManager::new()));

    for (id, service_config) in config.services.iter() {
        service
            .lock()
            .await
            .add(
                &id,
                &service_config.program,
                service_config.default_args.clone(),
                service_config.allow_args_override.unwrap_or(false),
                service_config.default_start.unwrap_or(false),
            )
            .await
            .unwrap_or_else(|e| panic!("Failed to register service due to {:?}", e));
    }

    tonic::transport::Server::builder()
        .accept_http1(true)
        .add_service(tonic_web::enable(
            proto::service_manager_server::ServiceManagerServer::new(service.clone()),
        ))
        .serve(config.server.service_manager_addr.parse().unwrap())
        .await
        .unwrap();

    signal::ctrl_c().await.unwrap();

    let mut service = service.lock().await;

    for (id, service) in service.service.iter_mut() {
        if let Err(e) = service.stop().await {
            warn!("Failed to terminate service {} due to {:?}", id, e);
        }
    }
}

#[cfg(test)]
mod test {
    use crate::Service;

    fn sleep_command() -> &'static str {
        if cfg!(target_os = "windows") {
            "timeout"
        } else {
            "sleep"
        }
    }

    #[tokio::test]
    async fn running() {
        let mut service = Service::new(
            "",
            sleep_command(),
            vec!["3".to_string()],
            false,
            true,
            None,
        )
        .await
        .unwrap();

        assert_eq!(service.running().await, true);
        tokio::time::sleep(std::time::Duration::from_millis(5000)).await;
        assert_eq!(service.running().await, false);
    }

    #[tokio::test]
    async fn non_default_start() {
        let mut service = Service::new(
            "",
            sleep_command(),
            vec!["3".to_string()],
            true,
            false,
            None,
        )
        .await
        .unwrap();

        assert_eq!(service.running().await, false);
        service.start(None).await.unwrap();
        assert_eq!(service.running().await, true);
        tokio::time::sleep(std::time::Duration::from_millis(5000)).await;
        assert_eq!(service.running().await, false);
    }

    #[tokio::test]
    async fn stop() {
        let mut service = Service::new(
            "",
            sleep_command(),
            vec!["3".to_string()],
            false,
            true,
            None,
        )
        .await
        .unwrap();

        assert_eq!(service.running().await, true);
        service.stop().await.unwrap();
        assert_eq!(service.running().await, false);
    }

    #[tokio::test]
    async fn start_with_override() {
        let mut service = Service::new(
            "",
            sleep_command(),
            vec!["10".to_string()],
            true,
            false,
            None,
        )
        .await
        .unwrap();

        service.start(Some(vec!["3".to_string()])).await.unwrap();
        tokio::time::sleep(std::time::Duration::from_millis(5000)).await;
        assert_eq!(service.running().await, false); // NOTE: assert fails if service survived for 10s
    }
}
