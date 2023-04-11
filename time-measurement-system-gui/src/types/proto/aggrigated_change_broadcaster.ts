// @generated by protobuf-ts 2.8.3
// @generated from protobuf file "aggrigated_change_broadcaster.proto" (package "has.aggrigatedchangebroadcaster", syntax proto3)
// tslint:disable
import { ServiceType } from "@protobuf-ts/runtime-rpc";
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message has.aggrigatedchangebroadcaster.SubscribeChangeRequest
 */
export interface SubscribeChangeRequest {
}
/**
 * @generated from protobuf message has.aggrigatedchangebroadcaster.SubscribeChangeReply
 */
export interface SubscribeChangeReply {
}
// @generated message type with reflection information, may provide speed optimized methods
class SubscribeChangeRequest$Type extends MessageType<SubscribeChangeRequest> {
    constructor() {
        super("has.aggrigatedchangebroadcaster.SubscribeChangeRequest", []);
    }
    create(value?: PartialMessage<SubscribeChangeRequest>): SubscribeChangeRequest {
        const message = {};
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<SubscribeChangeRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SubscribeChangeRequest): SubscribeChangeRequest {
        return target ?? this.create();
    }
    internalBinaryWrite(message: SubscribeChangeRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message has.aggrigatedchangebroadcaster.SubscribeChangeRequest
 */
export const SubscribeChangeRequest = new SubscribeChangeRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SubscribeChangeReply$Type extends MessageType<SubscribeChangeReply> {
    constructor() {
        super("has.aggrigatedchangebroadcaster.SubscribeChangeReply", []);
    }
    create(value?: PartialMessage<SubscribeChangeReply>): SubscribeChangeReply {
        const message = {};
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<SubscribeChangeReply>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SubscribeChangeReply): SubscribeChangeReply {
        return target ?? this.create();
    }
    internalBinaryWrite(message: SubscribeChangeReply, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message has.aggrigatedchangebroadcaster.SubscribeChangeReply
 */
export const SubscribeChangeReply = new SubscribeChangeReply$Type();
/**
 * @generated ServiceType for protobuf service has.aggrigatedchangebroadcaster.AggrigatedChangeBroadcaster
 */
export const AggrigatedChangeBroadcaster = new ServiceType("has.aggrigatedchangebroadcaster.AggrigatedChangeBroadcaster", [
    { name: "SubscribeChange", serverStreaming: true, options: {}, I: SubscribeChangeRequest, O: SubscribeChangeReply }
]);