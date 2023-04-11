// @generated by protobuf-ts 2.8.3
// @generated from protobuf file "records.proto" (package "has.records", syntax proto3)
// tslint:disable
// @ts-nocheck
import type { RpcTransport } from "@protobuf-ts/runtime-rpc";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import { Records } from "./records";
import type { SubscribeChangeRequest } from "./records";
import type { ServerStreamingCall } from "@protobuf-ts/runtime-rpc";
import type { ReadAllReply } from "./records";
import type { ReadAllRequest } from "./records";
import type { RemoveAllRequest } from "./records";
import type { UpdateRequest } from "./records";
import type { RemoveRequest } from "./records";
import { stackIntercept } from "@protobuf-ts/runtime-rpc";
import type { CommandReply } from "./records";
import type { InsertRequest } from "./records";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service has.records.Records
 */
export interface IRecordsClient {
    /**
     * @generated from protobuf rpc: Insert(has.records.InsertRequest) returns (has.records.CommandReply);
     */
    insert(input: InsertRequest, options?: RpcOptions): UnaryCall<InsertRequest, CommandReply>;
    /**
     * @generated from protobuf rpc: Remove(has.records.RemoveRequest) returns (has.records.CommandReply);
     */
    remove(input: RemoveRequest, options?: RpcOptions): UnaryCall<RemoveRequest, CommandReply>;
    /**
     * @generated from protobuf rpc: Update(has.records.UpdateRequest) returns (has.records.CommandReply);
     */
    update(input: UpdateRequest, options?: RpcOptions): UnaryCall<UpdateRequest, CommandReply>;
    /**
     * rpc InsertMany(InsertManyRequest) returns (CommandReply) {}
     *
     * @generated from protobuf rpc: RemoveAll(has.records.RemoveAllRequest) returns (has.records.CommandReply);
     */
    removeAll(input: RemoveAllRequest, options?: RpcOptions): UnaryCall<RemoveAllRequest, CommandReply>;
    /**
     * rpc ReplaceAll(ReplaceAllRequest) returns (CommandReply) {}
     *
     * @generated from protobuf rpc: ReadAll(has.records.ReadAllRequest) returns (has.records.ReadAllReply);
     */
    readAll(input: ReadAllRequest, options?: RpcOptions): UnaryCall<ReadAllRequest, ReadAllReply>;
    /**
     * @generated from protobuf rpc: SubscribeChange(has.records.SubscribeChangeRequest) returns (stream has.records.ReadAllReply);
     */
    subscribeChange(input: SubscribeChangeRequest, options?: RpcOptions): ServerStreamingCall<SubscribeChangeRequest, ReadAllReply>;
}
/**
 * @generated from protobuf service has.records.Records
 */
export class RecordsClient implements IRecordsClient, ServiceInfo {
    typeName = Records.typeName;
    methods = Records.methods;
    options = Records.options;
    constructor(private readonly _transport: RpcTransport) {
    }
    /**
     * @generated from protobuf rpc: Insert(has.records.InsertRequest) returns (has.records.CommandReply);
     */
    insert(input: InsertRequest, options?: RpcOptions): UnaryCall<InsertRequest, CommandReply> {
        const method = this.methods[0], opt = this._transport.mergeOptions(options);
        return stackIntercept<InsertRequest, CommandReply>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: Remove(has.records.RemoveRequest) returns (has.records.CommandReply);
     */
    remove(input: RemoveRequest, options?: RpcOptions): UnaryCall<RemoveRequest, CommandReply> {
        const method = this.methods[1], opt = this._transport.mergeOptions(options);
        return stackIntercept<RemoveRequest, CommandReply>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: Update(has.records.UpdateRequest) returns (has.records.CommandReply);
     */
    update(input: UpdateRequest, options?: RpcOptions): UnaryCall<UpdateRequest, CommandReply> {
        const method = this.methods[2], opt = this._transport.mergeOptions(options);
        return stackIntercept<UpdateRequest, CommandReply>("unary", this._transport, method, opt, input);
    }
    /**
     * rpc InsertMany(InsertManyRequest) returns (CommandReply) {}
     *
     * @generated from protobuf rpc: RemoveAll(has.records.RemoveAllRequest) returns (has.records.CommandReply);
     */
    removeAll(input: RemoveAllRequest, options?: RpcOptions): UnaryCall<RemoveAllRequest, CommandReply> {
        const method = this.methods[3], opt = this._transport.mergeOptions(options);
        return stackIntercept<RemoveAllRequest, CommandReply>("unary", this._transport, method, opt, input);
    }
    /**
     * rpc ReplaceAll(ReplaceAllRequest) returns (CommandReply) {}
     *
     * @generated from protobuf rpc: ReadAll(has.records.ReadAllRequest) returns (has.records.ReadAllReply);
     */
    readAll(input: ReadAllRequest, options?: RpcOptions): UnaryCall<ReadAllRequest, ReadAllReply> {
        const method = this.methods[4], opt = this._transport.mergeOptions(options);
        return stackIntercept<ReadAllRequest, ReadAllReply>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: SubscribeChange(has.records.SubscribeChangeRequest) returns (stream has.records.ReadAllReply);
     */
    subscribeChange(input: SubscribeChangeRequest, options?: RpcOptions): ServerStreamingCall<SubscribeChangeRequest, ReadAllReply> {
        const method = this.methods[5], opt = this._transport.mergeOptions(options);
        return stackIntercept<SubscribeChangeRequest, ReadAllReply>("serverStreaming", this._transport, method, opt, input);
    }
}
