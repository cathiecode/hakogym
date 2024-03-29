// @ts-nocheck
// @generated by protobuf-ts 2.8.3
// @generated from protobuf file "service_manager.proto" (package "has.servicemanager", syntax proto3)
// tslint:disable
import type { RpcTransport } from "@protobuf-ts/runtime-rpc";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import { ServiceManager } from "./service_manager";
import type { StatusReply } from "./service_manager";
import type { StatusRequest } from "./service_manager";
import type { ServiceSpecificRequest } from "./service_manager";
import { stackIntercept } from "@protobuf-ts/runtime-rpc";
import type { CommandReply } from "./service_manager";
import type { StartRequest } from "./service_manager";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service has.servicemanager.ServiceManager
 */
export interface IServiceManagerClient {
    /**
     * @generated from protobuf rpc: Start(has.servicemanager.StartRequest) returns (has.servicemanager.CommandReply);
     */
    start(input: StartRequest, options?: RpcOptions): UnaryCall<StartRequest, CommandReply>;
    /**
     * @generated from protobuf rpc: Stop(has.servicemanager.ServiceSpecificRequest) returns (has.servicemanager.CommandReply);
     */
    stop(input: ServiceSpecificRequest, options?: RpcOptions): UnaryCall<ServiceSpecificRequest, CommandReply>;
    /**
     * @generated from protobuf rpc: Status(has.servicemanager.StatusRequest) returns (has.servicemanager.StatusReply);
     */
    status(input: StatusRequest, options?: RpcOptions): UnaryCall<StatusRequest, StatusReply>;
}
/**
 * @generated from protobuf service has.servicemanager.ServiceManager
 */
export class ServiceManagerClient implements IServiceManagerClient, ServiceInfo {
    typeName = ServiceManager.typeName;
    methods = ServiceManager.methods;
    options = ServiceManager.options;
    constructor(private readonly _transport: RpcTransport) {
    }
    /**
     * @generated from protobuf rpc: Start(has.servicemanager.StartRequest) returns (has.servicemanager.CommandReply);
     */
    start(input: StartRequest, options?: RpcOptions): UnaryCall<StartRequest, CommandReply> {
        const method = this.methods[0], opt = this._transport.mergeOptions(options);
        return stackIntercept<StartRequest, CommandReply>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: Stop(has.servicemanager.ServiceSpecificRequest) returns (has.servicemanager.CommandReply);
     */
    stop(input: ServiceSpecificRequest, options?: RpcOptions): UnaryCall<ServiceSpecificRequest, CommandReply> {
        const method = this.methods[1], opt = this._transport.mergeOptions(options);
        return stackIntercept<ServiceSpecificRequest, CommandReply>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: Status(has.servicemanager.StatusRequest) returns (has.servicemanager.StatusReply);
     */
    status(input: StatusRequest, options?: RpcOptions): UnaryCall<StatusRequest, StatusReply> {
        const method = this.methods[2], opt = this._transport.mergeOptions(options);
        return stackIntercept<StatusRequest, StatusReply>("unary", this._transport, method, opt, input);
    }
}
