// @generated by protobuf-ts 2.8.3
// @generated from protobuf file "aggrigated_change_broadcaster.proto" (package "has.aggrigatedchangebroadcaster", syntax proto3)
// tslint:disable
import type { RpcTransport } from "@protobuf-ts/runtime-rpc";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import { AggrigatedChangeBroadcaster } from "./aggrigated_change_broadcaster";
import { stackIntercept } from "@protobuf-ts/runtime-rpc";
import type { SubscribeChangeReply } from "./aggrigated_change_broadcaster";
import type { SubscribeChangeRequest } from "./aggrigated_change_broadcaster";
import type { ServerStreamingCall } from "@protobuf-ts/runtime-rpc";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service has.aggrigatedchangebroadcaster.AggrigatedChangeBroadcaster
 */
export interface IAggrigatedChangeBroadcasterClient {
    /**
     * @generated from protobuf rpc: SubscribeChange(has.aggrigatedchangebroadcaster.SubscribeChangeRequest) returns (stream has.aggrigatedchangebroadcaster.SubscribeChangeReply);
     */
    subscribeChange(input: SubscribeChangeRequest, options?: RpcOptions): ServerStreamingCall<SubscribeChangeRequest, SubscribeChangeReply>;
}
/**
 * @generated from protobuf service has.aggrigatedchangebroadcaster.AggrigatedChangeBroadcaster
 */
export class AggrigatedChangeBroadcasterClient implements IAggrigatedChangeBroadcasterClient, ServiceInfo {
    typeName = AggrigatedChangeBroadcaster.typeName;
    methods = AggrigatedChangeBroadcaster.methods;
    options = AggrigatedChangeBroadcaster.options;
    constructor(private readonly _transport: RpcTransport) {
    }
    /**
     * @generated from protobuf rpc: SubscribeChange(has.aggrigatedchangebroadcaster.SubscribeChangeRequest) returns (stream has.aggrigatedchangebroadcaster.SubscribeChangeReply);
     */
    subscribeChange(input: SubscribeChangeRequest, options?: RpcOptions): ServerStreamingCall<SubscribeChangeRequest, SubscribeChangeReply> {
        const method = this.methods[0], opt = this._transport.mergeOptions(options);
        return stackIntercept<SubscribeChangeRequest, SubscribeChangeReply>("serverStreaming", this._transport, method, opt, input);
    }
}