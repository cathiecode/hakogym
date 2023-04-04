export type ParsedMetaData = {
    carId: string
};

export function parseMetaData(metaData: string): ParsedMetaData {
    return JSON.parse(metaData);
}

export function packMetaData(metaData: ParsedMetaData) {
    return JSON.stringify(metaData);
}