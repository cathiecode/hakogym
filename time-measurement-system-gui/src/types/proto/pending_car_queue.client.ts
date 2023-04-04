// @generated by protobuf-ts 2.8.3
// @generated from protobuf file "pending_car_queue.proto" (package "has.pendingcarqueue", syntax proto3)
// tslint:disable
import type { RpcTransport } from "@protobuf-ts/runtime-rpc";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import { PendingCarQueue } from "./pending_car_queue";
import type { SubscribeChangeRequest } from "./pending_car_queue";
import type { ServerStreamingCall } from "@protobuf-ts/runtime-rpc";
import type { ReadAllReply } from "./pending_car_queue";
import type { ReadAllRequest } from "./pending_car_queue";
import type { ReplaceAllRequest } from "./pending_car_queue";
import type { RemoveAllRequest } from "./pending_car_queue";
import type { InsertManyRequest } from "./pending_car_queue";
import type { UpdateRequest } from "./pending_car_queue";
import type { RemoveRequest } from "./pending_car_queue";
import { stackIntercept } from "@protobuf-ts/runtime-rpc";
import type { CommandReply } from "./pending_car_queue";
import type { InsertRequest } from "./pending_car_queue";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service has.pendingcarqueue.PendingCarQueue
 */
export interface IPendingCarQueueClient {
    /**
     * @generated from protobuf rpc: Insert(has.pendingcarqueue.InsertRequest) returns (has.pendingcarqueue.CommandReply);
     */
    insert(input: InsertRequest, options?: RpcOptions): UnaryCall<InsertRequest, CommandReply>;
    /**
     * @generated from protobuf rpc: Remove(has.pendingcarqueue.RemoveRequest) returns (has.pendingcarqueue.CommandReply);
     */
    remove(input: RemoveRequest, options?: RpcOptions): UnaryCall<RemoveRequest, CommandReply>;
    /**
     * @generated from protobuf rpc: Update(has.pendingcarqueue.UpdateRequest) returns (has.pendingcarqueue.CommandReply);
     */
    update(input: UpdateRequest, options?: RpcOptions): UnaryCall<UpdateRequest, CommandReply>;
    /**
     * @generated from protobuf rpc: InsertMany(has.pendingcarqueue.InsertManyRequest) returns (has.pendingcarqueue.CommandReply);
     */
    insertMany(input: InsertManyRequest, options?: RpcOptions): UnaryCall<InsertManyRequest, CommandReply>;
    /**
     * @generated from protobuf rpc: RemoveAll(has.pendingcarqueue.RemoveAllRequest) returns (has.pendingcarqueue.CommandReply);
     */
    removeAll(input: RemoveAllRequest, options?: RpcOptions): UnaryCall<RemoveAllRequest, CommandReply>;
    /**
     * @generated from protobuf rpc: ReplaceAll(has.pendingcarqueue.ReplaceAllRequest) returns (has.pendingcarqueue.CommandReply);
     */
    replaceAll(input: ReplaceAllRequest, options?: RpcOptions): UnaryCall<ReplaceAllRequest, CommandReply>;
    /**
     * @generated from protobuf rpc: ReadAll(has.pendingcarqueue.ReadAllRequest) returns (has.pendingcarqueue.ReadAllReply);
     */
    readAll(input: ReadAllRequest, options?: RpcOptions): UnaryCall<ReadAllRequest, ReadAllReply>;
    /**
     * @generated from protobuf rpc: SubscribeChange(has.pendingcarqueue.SubscribeChangeRequest) returns (stream has.pendingcarqueue.ReadAllReply);
     */
    subscribeChange(input: SubscribeChangeRequest, options?: RpcOptions): ServerStreamingCall<SubscribeChangeRequest, ReadAllReply>;
}
/**
 * @generated from protobuf service has.pendingcarqueue.PendingCarQueue
 */
export class PendingCarQueueClient implements IPendingCarQueueClient, ServiceInfo {
    typeName = PendingCarQueue.typeName;
    methods = PendingCarQueue.methods;
    options = PendingCarQueue.options;
    constructor(private readonly _transport: RpcTransport) {
    }
    /**
     * @generated from protobuf rpc: Insert(has.pendingcarqueue.InsertRequest) returns (has.pendingcarqueue.CommandReply);
     */
    insert(input: InsertRequest, options?: RpcOptions): UnaryCall<InsertRequest, CommandReply> {
        const method = this.methods[0], opt = this._transport.mergeOptions(options);
        return stackIntercept<InsertRequest, CommandReply>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: Remove(has.pendingcarqueue.RemoveRequest) returns (has.pendingcarqueue.CommandReply);
     */
    remove(input: RemoveRequest, options?: RpcOptions): UnaryCall<RemoveRequest, CommandReply> {
        const method = this.methods[1], opt = this._transport.mergeOptions(options);
        return stackIntercept<RemoveRequest, CommandReply>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: Update(has.pendingcarqueue.UpdateRequest) returns (has.pendingcarqueue.CommandReply);
     */
    update(input: UpdateRequest, options?: RpcOptions): UnaryCall<UpdateRequest, CommandReply> {
        const method = this.methods[2], opt = this._transport.mergeOptions(options);
        return stackIntercept<UpdateRequest, CommandReply>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: InsertMany(has.pendingcarqueue.InsertManyRequest) returns (has.pendingcarqueue.CommandReply);
     */
    insertMany(input: InsertManyRequest, options?: RpcOptions): UnaryCall<InsertManyRequest, CommandReply> {
        const method = this.methods[3], opt = this._transport.mergeOptions(options);
        return stackIntercept<InsertManyRequest, CommandReply>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: RemoveAll(has.pendingcarqueue.RemoveAllRequest) returns (has.pendingcarqueue.CommandReply);
     */
    removeAll(input: RemoveAllRequest, options?: RpcOptions): UnaryCall<RemoveAllRequest, CommandReply> {
        const method = this.methods[4], opt = this._transport.mergeOptions(options);
        return stackIntercept<RemoveAllRequest, CommandReply>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: ReplaceAll(has.pendingcarqueue.ReplaceAllRequest) returns (has.pendingcarqueue.CommandReply);
     */
    replaceAll(input: ReplaceAllRequest, options?: RpcOptions): UnaryCall<ReplaceAllRequest, CommandReply> {
        const method = this.methods[5], opt = this._transport.mergeOptions(options);
        return stackIntercept<ReplaceAllRequest, CommandReply>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: ReadAll(has.pendingcarqueue.ReadAllRequest) returns (has.pendingcarqueue.ReadAllReply);
     */
    readAll(input: ReadAllRequest, options?: RpcOptions): UnaryCall<ReadAllRequest, ReadAllReply> {
        const method = this.methods[6], opt = this._transport.mergeOptions(options);
        return stackIntercept<ReadAllRequest, ReadAllReply>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: SubscribeChange(has.pendingcarqueue.SubscribeChangeRequest) returns (stream has.pendingcarqueue.ReadAllReply);
     */
    subscribeChange(input: SubscribeChangeRequest, options?: RpcOptions): ServerStreamingCall<SubscribeChangeRequest, ReadAllReply> {
        const method = this.methods[7], opt = this._transport.mergeOptions(options);
        return stackIntercept<SubscribeChangeRequest, ReadAllReply>("serverStreaming", this._transport, method, opt, input);
    }
}
