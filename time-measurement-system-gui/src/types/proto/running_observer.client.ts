// @generated by protobuf-ts 2.8.3
// @generated from protobuf file "running_observer.proto" (package "has.runningobserver", syntax proto3)
// tslint:disable
import type { RpcTransport } from "@protobuf-ts/runtime-rpc";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import { RunningObserver } from "./running_observer";
import type { SubscribeChangeRequest } from "./running_observer";
import type { ServerStreamingCall } from "@protobuf-ts/runtime-rpc";
import type { ReadAllReply } from "./running_observer";
import type { ReadAllRequest } from "./running_observer";
import type { UpdateMetadataCommandRequest } from "./running_observer";
import type { FlipRunningStateCommandRequest } from "./running_observer";
import type { StopCommandRequest } from "./running_observer";
import { stackIntercept } from "@protobuf-ts/runtime-rpc";
import type { CommandReply } from "./running_observer";
import type { StartCommandRequest } from "./running_observer";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
/**
 * `RunningObserver` サービスはトラック上の車両の記録を管理します。それぞれのコマンドリクエストにはtimestampが必要で、以前に発行されたコマンドのtimestampより小さい値を持つコマンドは実行が拒否されます。
 *
 * @generated from protobuf service has.runningobserver.RunningObserver
 */
export interface IRunningObserverClient {
    /**
     * PendingCarQueueサービスから一番後ろにある車両データを取り出し走行開始日時を記録します。
     *
     * @generated from protobuf rpc: Start(has.runningobserver.StartCommandRequest) returns (has.runningobserver.CommandReply);
     */
    start(input: StartCommandRequest, options?: RpcOptions): UnaryCall<StartCommandRequest, CommandReply>;
    /**
     * 走行中の車両を停止させ、走行時間を計算し、Recordsサービスに保存します。
     *
     * @generated from protobuf rpc: Stop(has.runningobserver.StopCommandRequest) returns (has.runningobserver.CommandReply);
     */
    stop(input: StopCommandRequest, options?: RpcOptions): UnaryCall<StopCommandRequest, CommandReply>;
    /**
     * 走行中の車両があれば、そのうち一番最初に走行を開始したものをStopします。走行中の車両がなければStartします。
     *
     * @generated from protobuf rpc: FlipRunningState(has.runningobserver.FlipRunningStateCommandRequest) returns (has.runningobserver.CommandReply);
     */
    flipRunningState(input: FlipRunningStateCommandRequest, options?: RpcOptions): UnaryCall<FlipRunningStateCommandRequest, CommandReply>;
    /**
     * 走行中の車両のメタデータを更新します。メタデータはconfigファイルのJSON Schemaに従っている必要があります。
     *
     * @generated from protobuf rpc: UpdateMetadata(has.runningobserver.UpdateMetadataCommandRequest) returns (has.runningobserver.CommandReply);
     */
    updateMetadata(input: UpdateMetadataCommandRequest, options?: RpcOptions): UnaryCall<UpdateMetadataCommandRequest, CommandReply>;
    /**
     * @generated from protobuf rpc: ReadAll(has.runningobserver.ReadAllRequest) returns (has.runningobserver.ReadAllReply);
     */
    readAll(input: ReadAllRequest, options?: RpcOptions): UnaryCall<ReadAllRequest, ReadAllReply>;
    /**
     * @generated from protobuf rpc: SubscribeChange(has.runningobserver.SubscribeChangeRequest) returns (stream has.runningobserver.ReadAllReply);
     */
    subscribeChange(input: SubscribeChangeRequest, options?: RpcOptions): ServerStreamingCall<SubscribeChangeRequest, ReadAllReply>;
}
/**
 * `RunningObserver` サービスはトラック上の車両の記録を管理します。それぞれのコマンドリクエストにはtimestampが必要で、以前に発行されたコマンドのtimestampより小さい値を持つコマンドは実行が拒否されます。
 *
 * @generated from protobuf service has.runningobserver.RunningObserver
 */
export class RunningObserverClient implements IRunningObserverClient, ServiceInfo {
    typeName = RunningObserver.typeName;
    methods = RunningObserver.methods;
    options = RunningObserver.options;
    constructor(private readonly _transport: RpcTransport) {
    }
    /**
     * PendingCarQueueサービスから一番後ろにある車両データを取り出し走行開始日時を記録します。
     *
     * @generated from protobuf rpc: Start(has.runningobserver.StartCommandRequest) returns (has.runningobserver.CommandReply);
     */
    start(input: StartCommandRequest, options?: RpcOptions): UnaryCall<StartCommandRequest, CommandReply> {
        const method = this.methods[0], opt = this._transport.mergeOptions(options);
        return stackIntercept<StartCommandRequest, CommandReply>("unary", this._transport, method, opt, input);
    }
    /**
     * 走行中の車両を停止させ、走行時間を計算し、Recordsサービスに保存します。
     *
     * @generated from protobuf rpc: Stop(has.runningobserver.StopCommandRequest) returns (has.runningobserver.CommandReply);
     */
    stop(input: StopCommandRequest, options?: RpcOptions): UnaryCall<StopCommandRequest, CommandReply> {
        const method = this.methods[1], opt = this._transport.mergeOptions(options);
        return stackIntercept<StopCommandRequest, CommandReply>("unary", this._transport, method, opt, input);
    }
    /**
     * 走行中の車両があれば、そのうち一番最初に走行を開始したものをStopします。走行中の車両がなければStartします。
     *
     * @generated from protobuf rpc: FlipRunningState(has.runningobserver.FlipRunningStateCommandRequest) returns (has.runningobserver.CommandReply);
     */
    flipRunningState(input: FlipRunningStateCommandRequest, options?: RpcOptions): UnaryCall<FlipRunningStateCommandRequest, CommandReply> {
        const method = this.methods[2], opt = this._transport.mergeOptions(options);
        return stackIntercept<FlipRunningStateCommandRequest, CommandReply>("unary", this._transport, method, opt, input);
    }
    /**
     * 走行中の車両のメタデータを更新します。メタデータはconfigファイルのJSON Schemaに従っている必要があります。
     *
     * @generated from protobuf rpc: UpdateMetadata(has.runningobserver.UpdateMetadataCommandRequest) returns (has.runningobserver.CommandReply);
     */
    updateMetadata(input: UpdateMetadataCommandRequest, options?: RpcOptions): UnaryCall<UpdateMetadataCommandRequest, CommandReply> {
        const method = this.methods[3], opt = this._transport.mergeOptions(options);
        return stackIntercept<UpdateMetadataCommandRequest, CommandReply>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: ReadAll(has.runningobserver.ReadAllRequest) returns (has.runningobserver.ReadAllReply);
     */
    readAll(input: ReadAllRequest, options?: RpcOptions): UnaryCall<ReadAllRequest, ReadAllReply> {
        const method = this.methods[4], opt = this._transport.mergeOptions(options);
        return stackIntercept<ReadAllRequest, ReadAllReply>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: SubscribeChange(has.runningobserver.SubscribeChangeRequest) returns (stream has.runningobserver.ReadAllReply);
     */
    subscribeChange(input: SubscribeChangeRequest, options?: RpcOptions): ServerStreamingCall<SubscribeChangeRequest, ReadAllReply> {
        const method = this.methods[5], opt = this._transport.mergeOptions(options);
        return stackIntercept<SubscribeChangeRequest, ReadAllReply>("serverStreaming", this._transport, method, opt, input);
    }
}