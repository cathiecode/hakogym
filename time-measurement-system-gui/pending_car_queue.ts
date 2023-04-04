/* eslint-disable */
import * as _m0 from "protobufjs/minimal";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { UInt32Value } from "./google/protobuf/wrappers";

export const protobufPackage = "has.pendingcarqueue";

export interface Item {
  meta: string;
}

export interface InsertedItem {
  id: string;
  meta: string;
}

export interface CommandReply {
}

export interface InsertRequest {
  item: Item | undefined;
  position: number | undefined;
}

export interface RemoveRequest {
  id: string;
}

export interface UpdateRequest {
  item: InsertedItem | undefined;
}

export interface InsertManyRequest {
  item: Item[];
  position: number | undefined;
}

export interface RemoveAllRequest {
}

export interface ReplaceAllRequest {
  item: Item[];
}

export interface ReadAllRequest {
}

export interface ReadAllReply {
  item: InsertedItem[];
}

export interface SubscribeChangeRequest {
}

function createBaseItem(): Item {
  return { meta: "" };
}

export const Item = {
  encode(message: Item, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.meta !== "") {
      writer.uint32(10).string(message.meta);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Item {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseItem();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.meta = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Item {
    return { meta: isSet(object.meta) ? String(object.meta) : "" };
  },

  toJSON(message: Item): unknown {
    const obj: any = {};
    message.meta !== undefined && (obj.meta = message.meta);
    return obj;
  },

  create<I extends Exact<DeepPartial<Item>, I>>(base?: I): Item {
    return Item.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Item>, I>>(object: I): Item {
    const message = createBaseItem();
    message.meta = object.meta ?? "";
    return message;
  },
};

function createBaseInsertedItem(): InsertedItem {
  return { id: "", meta: "" };
}

export const InsertedItem = {
  encode(message: InsertedItem, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.meta !== "") {
      writer.uint32(18).string(message.meta);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InsertedItem {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInsertedItem();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.meta = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): InsertedItem {
    return { id: isSet(object.id) ? String(object.id) : "", meta: isSet(object.meta) ? String(object.meta) : "" };
  },

  toJSON(message: InsertedItem): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.meta !== undefined && (obj.meta = message.meta);
    return obj;
  },

  create<I extends Exact<DeepPartial<InsertedItem>, I>>(base?: I): InsertedItem {
    return InsertedItem.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<InsertedItem>, I>>(object: I): InsertedItem {
    const message = createBaseInsertedItem();
    message.id = object.id ?? "";
    message.meta = object.meta ?? "";
    return message;
  },
};

function createBaseCommandReply(): CommandReply {
  return {};
}

export const CommandReply = {
  encode(_: CommandReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CommandReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommandReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): CommandReply {
    return {};
  },

  toJSON(_: CommandReply): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<CommandReply>, I>>(base?: I): CommandReply {
    return CommandReply.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<CommandReply>, I>>(_: I): CommandReply {
    const message = createBaseCommandReply();
    return message;
  },
};

function createBaseInsertRequest(): InsertRequest {
  return { item: undefined, position: undefined };
}

export const InsertRequest = {
  encode(message: InsertRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.item !== undefined) {
      Item.encode(message.item, writer.uint32(10).fork()).ldelim();
    }
    if (message.position !== undefined) {
      UInt32Value.encode({ value: message.position! }, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InsertRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInsertRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.item = Item.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.position = UInt32Value.decode(reader, reader.uint32()).value;
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): InsertRequest {
    return {
      item: isSet(object.item) ? Item.fromJSON(object.item) : undefined,
      position: isSet(object.position) ? Number(object.position) : undefined,
    };
  },

  toJSON(message: InsertRequest): unknown {
    const obj: any = {};
    message.item !== undefined && (obj.item = message.item ? Item.toJSON(message.item) : undefined);
    message.position !== undefined && (obj.position = message.position);
    return obj;
  },

  create<I extends Exact<DeepPartial<InsertRequest>, I>>(base?: I): InsertRequest {
    return InsertRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<InsertRequest>, I>>(object: I): InsertRequest {
    const message = createBaseInsertRequest();
    message.item = (object.item !== undefined && object.item !== null) ? Item.fromPartial(object.item) : undefined;
    message.position = object.position ?? undefined;
    return message;
  },
};

function createBaseRemoveRequest(): RemoveRequest {
  return { id: "" };
}

export const RemoveRequest = {
  encode(message: RemoveRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RemoveRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRemoveRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RemoveRequest {
    return { id: isSet(object.id) ? String(object.id) : "" };
  },

  toJSON(message: RemoveRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    return obj;
  },

  create<I extends Exact<DeepPartial<RemoveRequest>, I>>(base?: I): RemoveRequest {
    return RemoveRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<RemoveRequest>, I>>(object: I): RemoveRequest {
    const message = createBaseRemoveRequest();
    message.id = object.id ?? "";
    return message;
  },
};

function createBaseUpdateRequest(): UpdateRequest {
  return { item: undefined };
}

export const UpdateRequest = {
  encode(message: UpdateRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.item !== undefined) {
      InsertedItem.encode(message.item, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.item = InsertedItem.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UpdateRequest {
    return { item: isSet(object.item) ? InsertedItem.fromJSON(object.item) : undefined };
  },

  toJSON(message: UpdateRequest): unknown {
    const obj: any = {};
    message.item !== undefined && (obj.item = message.item ? InsertedItem.toJSON(message.item) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<UpdateRequest>, I>>(base?: I): UpdateRequest {
    return UpdateRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<UpdateRequest>, I>>(object: I): UpdateRequest {
    const message = createBaseUpdateRequest();
    message.item = (object.item !== undefined && object.item !== null)
      ? InsertedItem.fromPartial(object.item)
      : undefined;
    return message;
  },
};

function createBaseInsertManyRequest(): InsertManyRequest {
  return { item: [], position: undefined };
}

export const InsertManyRequest = {
  encode(message: InsertManyRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.item) {
      Item.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.position !== undefined) {
      UInt32Value.encode({ value: message.position! }, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InsertManyRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInsertManyRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.item.push(Item.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.position = UInt32Value.decode(reader, reader.uint32()).value;
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): InsertManyRequest {
    return {
      item: Array.isArray(object?.item) ? object.item.map((e: any) => Item.fromJSON(e)) : [],
      position: isSet(object.position) ? Number(object.position) : undefined,
    };
  },

  toJSON(message: InsertManyRequest): unknown {
    const obj: any = {};
    if (message.item) {
      obj.item = message.item.map((e) => e ? Item.toJSON(e) : undefined);
    } else {
      obj.item = [];
    }
    message.position !== undefined && (obj.position = message.position);
    return obj;
  },

  create<I extends Exact<DeepPartial<InsertManyRequest>, I>>(base?: I): InsertManyRequest {
    return InsertManyRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<InsertManyRequest>, I>>(object: I): InsertManyRequest {
    const message = createBaseInsertManyRequest();
    message.item = object.item?.map((e) => Item.fromPartial(e)) || [];
    message.position = object.position ?? undefined;
    return message;
  },
};

function createBaseRemoveAllRequest(): RemoveAllRequest {
  return {};
}

export const RemoveAllRequest = {
  encode(_: RemoveAllRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RemoveAllRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRemoveAllRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): RemoveAllRequest {
    return {};
  },

  toJSON(_: RemoveAllRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<RemoveAllRequest>, I>>(base?: I): RemoveAllRequest {
    return RemoveAllRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<RemoveAllRequest>, I>>(_: I): RemoveAllRequest {
    const message = createBaseRemoveAllRequest();
    return message;
  },
};

function createBaseReplaceAllRequest(): ReplaceAllRequest {
  return { item: [] };
}

export const ReplaceAllRequest = {
  encode(message: ReplaceAllRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.item) {
      Item.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ReplaceAllRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseReplaceAllRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.item.push(Item.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ReplaceAllRequest {
    return { item: Array.isArray(object?.item) ? object.item.map((e: any) => Item.fromJSON(e)) : [] };
  },

  toJSON(message: ReplaceAllRequest): unknown {
    const obj: any = {};
    if (message.item) {
      obj.item = message.item.map((e) => e ? Item.toJSON(e) : undefined);
    } else {
      obj.item = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ReplaceAllRequest>, I>>(base?: I): ReplaceAllRequest {
    return ReplaceAllRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ReplaceAllRequest>, I>>(object: I): ReplaceAllRequest {
    const message = createBaseReplaceAllRequest();
    message.item = object.item?.map((e) => Item.fromPartial(e)) || [];
    return message;
  },
};

function createBaseReadAllRequest(): ReadAllRequest {
  return {};
}

export const ReadAllRequest = {
  encode(_: ReadAllRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ReadAllRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseReadAllRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): ReadAllRequest {
    return {};
  },

  toJSON(_: ReadAllRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<ReadAllRequest>, I>>(base?: I): ReadAllRequest {
    return ReadAllRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ReadAllRequest>, I>>(_: I): ReadAllRequest {
    const message = createBaseReadAllRequest();
    return message;
  },
};

function createBaseReadAllReply(): ReadAllReply {
  return { item: [] };
}

export const ReadAllReply = {
  encode(message: ReadAllReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.item) {
      InsertedItem.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ReadAllReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseReadAllReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.item.push(InsertedItem.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ReadAllReply {
    return { item: Array.isArray(object?.item) ? object.item.map((e: any) => InsertedItem.fromJSON(e)) : [] };
  },

  toJSON(message: ReadAllReply): unknown {
    const obj: any = {};
    if (message.item) {
      obj.item = message.item.map((e) => e ? InsertedItem.toJSON(e) : undefined);
    } else {
      obj.item = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ReadAllReply>, I>>(base?: I): ReadAllReply {
    return ReadAllReply.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ReadAllReply>, I>>(object: I): ReadAllReply {
    const message = createBaseReadAllReply();
    message.item = object.item?.map((e) => InsertedItem.fromPartial(e)) || [];
    return message;
  },
};

function createBaseSubscribeChangeRequest(): SubscribeChangeRequest {
  return {};
}

export const SubscribeChangeRequest = {
  encode(_: SubscribeChangeRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SubscribeChangeRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubscribeChangeRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): SubscribeChangeRequest {
    return {};
  },

  toJSON(_: SubscribeChangeRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<SubscribeChangeRequest>, I>>(base?: I): SubscribeChangeRequest {
    return SubscribeChangeRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<SubscribeChangeRequest>, I>>(_: I): SubscribeChangeRequest {
    const message = createBaseSubscribeChangeRequest();
    return message;
  },
};

export interface PendingCarQueue {
  Insert(request: InsertRequest): Promise<CommandReply>;
  Remove(request: RemoveRequest): Promise<CommandReply>;
  Update(request: UpdateRequest): Promise<CommandReply>;
  InsertMany(request: InsertManyRequest): Promise<CommandReply>;
  RemoveAll(request: RemoveAllRequest): Promise<CommandReply>;
  ReplaceAll(request: ReplaceAllRequest): Promise<CommandReply>;
  ReadAll(request: ReadAllRequest): Promise<ReadAllReply>;
  SubscribeChange(request: SubscribeChangeRequest): Observable<ReadAllReply>;
}

export class PendingCarQueueClientImpl implements PendingCarQueue {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || "has.pendingcarqueue.PendingCarQueue";
    this.rpc = rpc;
    this.Insert = this.Insert.bind(this);
    this.Remove = this.Remove.bind(this);
    this.Update = this.Update.bind(this);
    this.InsertMany = this.InsertMany.bind(this);
    this.RemoveAll = this.RemoveAll.bind(this);
    this.ReplaceAll = this.ReplaceAll.bind(this);
    this.ReadAll = this.ReadAll.bind(this);
    this.SubscribeChange = this.SubscribeChange.bind(this);
  }
  Insert(request: InsertRequest): Promise<CommandReply> {
    const data = InsertRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "Insert", data);
    return promise.then((data) => CommandReply.decode(_m0.Reader.create(data)));
  }

  Remove(request: RemoveRequest): Promise<CommandReply> {
    const data = RemoveRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "Remove", data);
    return promise.then((data) => CommandReply.decode(_m0.Reader.create(data)));
  }

  Update(request: UpdateRequest): Promise<CommandReply> {
    const data = UpdateRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "Update", data);
    return promise.then((data) => CommandReply.decode(_m0.Reader.create(data)));
  }

  InsertMany(request: InsertManyRequest): Promise<CommandReply> {
    const data = InsertManyRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "InsertMany", data);
    return promise.then((data) => CommandReply.decode(_m0.Reader.create(data)));
  }

  RemoveAll(request: RemoveAllRequest): Promise<CommandReply> {
    const data = RemoveAllRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "RemoveAll", data);
    return promise.then((data) => CommandReply.decode(_m0.Reader.create(data)));
  }

  ReplaceAll(request: ReplaceAllRequest): Promise<CommandReply> {
    const data = ReplaceAllRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ReplaceAll", data);
    return promise.then((data) => CommandReply.decode(_m0.Reader.create(data)));
  }

  ReadAll(request: ReadAllRequest): Promise<ReadAllReply> {
    const data = ReadAllRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ReadAll", data);
    return promise.then((data) => ReadAllReply.decode(_m0.Reader.create(data)));
  }

  SubscribeChange(request: SubscribeChangeRequest): Observable<ReadAllReply> {
    const data = SubscribeChangeRequest.encode(request).finish();
    const result = this.rpc.serverStreamingRequest(this.service, "SubscribeChange", data);
    return result.pipe(map((data) => ReadAllReply.decode(_m0.Reader.create(data))));
  }
}

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
  clientStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Promise<Uint8Array>;
  serverStreamingRequest(service: string, method: string, data: Uint8Array): Observable<Uint8Array>;
  bidirectionalStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Observable<Uint8Array>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
