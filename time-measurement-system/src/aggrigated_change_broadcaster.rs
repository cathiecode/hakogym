use log::error;
use std::sync::Arc;
use tokio::{select, sync::Mutex};

use crate::{
    pending_car_queue::PendingCarQueue, records::Records, running_observer::RunningObserver,
};

pub struct AggrigatedChangeBroadcaster {
    watcher: tokio::sync::watch::Receiver<()>,
}

impl AggrigatedChangeBroadcaster {
    pub async fn new(
        running_observer: Arc<Mutex<RunningObserver>>,
        pending_car_queue: Arc<Mutex<PendingCarQueue>>,
        records: Arc<Mutex<Records>>,
    ) -> AggrigatedChangeBroadcaster {
        let mut running_observer_watcher = running_observer.lock().await.watcher().clone();
        let mut pending_car_queue_watcher = pending_car_queue.lock().await.watcher().clone();
        let mut records_watcher = records.lock().await.watcher().clone();

        let (on_change, watcher) = tokio::sync::watch::channel(());

        tokio::spawn(async move {
            while select! { w = running_observer_watcher.changed() => w.is_ok(), w = pending_car_queue_watcher.changed() => w.is_ok(), w = records_watcher.changed() => w.is_ok()}
            {
                on_change
                    .send(())
                    .unwrap_or_else(|_| error!("Failed to broadcast change"));
            }
        });

        AggrigatedChangeBroadcaster { watcher }
    }
}

pub mod server {
    use std::{pin::Pin, sync::Arc};

    use async_trait::async_trait;
    use log::trace;
    use tokio::sync::Mutex;
    use tokio_stream::Stream;
    use tonic::{Request, Status};

    use crate::proto::aggrigated_change_broadcaster::{self as proto, SubscribeChangeReply};

    use super::AggrigatedChangeBroadcaster;

    #[async_trait]
    impl proto::aggrigated_change_broadcaster_server::AggrigatedChangeBroadcaster
        for Arc<Mutex<AggrigatedChangeBroadcaster>>
    {
        type SubscribeChangeStream =
            Pin<Box<dyn Stream<Item = Result<proto::SubscribeChangeReply, Status>> + Send>>;

        async fn subscribe_change(
            &self,
            _request: Request<proto::SubscribeChangeRequest>,
        ) -> Result<tonic::Response<Self::SubscribeChangeStream>, Status> {
            let (tx, rx) = tokio::sync::mpsc::channel(1);
            let mut watcher = self.lock().await.watcher.clone();
            tokio::spawn(async move {
                while watcher.changed().await.is_ok() {
                    trace!("aggrigated change received!");

                    match tx
                        .send(Result::<_, Status>::Ok(SubscribeChangeReply {}))
                        .await
                    {
                        Ok(_) => {}
                        Err(_item) => {
                            break;
                        }
                    }
                }
            });

            let out_stream = tokio_stream::wrappers::ReceiverStream::new(rx);

            Ok(tonic::Response::new(
                Box::pin(out_stream) as Self::SubscribeChangeStream
            ))
        }
    }
}
