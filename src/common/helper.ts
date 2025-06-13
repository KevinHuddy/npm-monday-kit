import dayjs from "dayjs"
import { MondayColumnType } from "./constants"
import { Column, ColumnValue } from "./models"
import { isEmpty } from "../utils"

type ColumnIdTypeMap = {
    [key: string]: string
}
export function generateColumnIdTypeMap(columns: Column[]): ColumnIdTypeMap {
    const result: ColumnIdTypeMap = {}
    for (const column of columns) {
        result[column.id] = column.type
    }
    return result
}

export function convertValueToMondayValue(
    columnType: string, 
    value: string | number | boolean
) {
    switch (columnType) {
        case MondayColumnType.NAME:
            return value
        case MondayColumnType.CHECKBOX:
            return {
                checked: value ? 'true' : 'false',
            };
        case MondayColumnType.BOARD_RELATION:
        case MondayColumnType.DEPENDENCY:
            if (Array.isArray(value)) {
                return {
                    item_ids: JSON.parse(JSON.stringify(value as unknown as string[])),
                }
            }
            if ( value === null ) {
                return null
            }
            return {
                item_ids: JSON.parse(JSON.stringify([value])),
            }
        case MondayColumnType.DATE: {
            let datevalue = dayjs(value as unknown as string)
            if (!datevalue.isValid()) {
                return null
            }
            return {
                date: datevalue.format('YYYY-MM-DD'),
                time: datevalue.format('HH:mm:ss'),
            }
        }
        case MondayColumnType.DROPDOWN:
            if (Array.isArray(value)) {
                return {
                    labels: value,
                };
            }
            return {
                labels: [value as string],
            };
        case MondayColumnType.EMAIL:
            return {
                email: value,
                text: value,
            };
        case MondayColumnType.LINK:
            return {
                url: value,
                text: value,
            }
        case MondayColumnType.LOCATION: {
            const [lat, lng, address] = (value as string).split(':');
            return {
                lat: lat ?? '',
                lng: lng ?? '',
                address: address ?? '',
            };
        }
        case MondayColumnType.LONG_TEXT:
            return {
                text: value,
            };
        case MondayColumnType.NUMBERS:
            return Number(String(value));
        case MondayColumnType.PEOPLE: {
            const res: { id: string; kind: string }[] = [];
            if (Array.isArray(value)) {
                value.forEach((person) => {
                    res.push({ id: person, kind: 'person' });
                });
            }
            return {
                personsAndTeams: res,
            };
        }
        case MondayColumnType.PHONE: {
            const [phone, countryCode] = (value as string).split(':');
            return {
                phone: `+${phone}`,
                countryShortName: countryCode ?? "CA",
            };
        }
        case MondayColumnType.STATUS:
            if (typeof value === 'number') {
                return {
                    index: value,
                };
            }
            return {
                label: value as string,
            };
        case MondayColumnType.TEXT:
            return value;
        case MondayColumnType.TIMELINE:
            const values = (value as string).split(':')
            return {
                from: values[0],
                to: values[1] ?? values[0],
            }
        default:
            return null
    }
}

export const parseMondayColumnValue = (columnValue: ColumnValue) => {
    switch (columnValue.type) {
        case MondayColumnType.BUTTON:
            return columnValue.label;
        case MondayColumnType.CHECKBOX:
            return JSON.parse(columnValue.value)?.checked ?? false;
        case MondayColumnType.COLOR_PICKER:
            return JSON.parse(columnValue.value)?.color.hex ?? null;
        case MondayColumnType.BOARD_RELATION:
            return columnValue.linked_item_ids ?? [];
        case MondayColumnType.COUNTRY:
            return JSON.parse(columnValue.value)?.countryName ?? null;
        case MondayColumnType.CREATION_LOG:
            return JSON.parse(columnValue.value)?.created_at ?? null;
        case MondayColumnType.DATE:
            if (isEmpty(columnValue.value)) {
                return null;
            }
            const dateTime = JSON.parse(columnValue.value);
            return {
                date: dateTime.date ?? null,
                time: dateTime.time ?? null
            };
        case MondayColumnType.DEPENDENCY:
            return columnValue.linked_item_ids ?? [];
        // TODO: Get array of titles by ids
        case MondayColumnType.DROPDOWN:
            return columnValue.text || null
            // console.log(JSON.parse(columnValue.value))
            // return JSON.parse(columnValue.value)?.text ?? [];
        case MondayColumnType.EMAIL:
            return JSON.parse(columnValue.value)?.email ?? null;
        case MondayColumnType.FILES: {
            return JSON.parse(columnValue.value).files.map(
                (file: { name: string, assetId?: string, fileId?:string, linkToFile?: string }) => ({
                    name: file.name,
                    assetId: file.assetId ?? null,
                    fileId: file.fileId ?? null,
                    linkToFile: file.linkToFile ?? null,
                })
            )
        }
        case MondayColumnType.FORMULA: {
            return {
                value: columnValue.display_value ?? null,
                formula: columnValue.column?.settings_str ?? null
            }
        }
        case MondayColumnType.HOUR:
            return null;
        case MondayColumnType.ITEM_ID:
            return null;
        case MondayColumnType.LAST_UPDATED:
            return null;
        case MondayColumnType.LINK:
            return JSON.parse(columnValue.value)?.url ?? null;
        case MondayColumnType.LOCATION:
            return null;
        case MondayColumnType.LONG_TEXT:
            return JSON.parse(columnValue.value)?.text ?? null;
        case MondayColumnType.MIRROR:
            return columnValue.display_value ?? null;
        case MondayColumnType.DOC:
            return JSON.parse(columnValue.value)?.files[0].linkToFile ?? null;
        case MondayColumnType.NUMBERS:
            return Number(JSON.parse(columnValue.value));
        case MondayColumnType.PEOPLE: {
            const people: number[] = []
            if (!isEmpty(columnValue.value)) {
                JSON.parse(columnValue.value).personsAndTeams.map(
                    (item: { id: number; kind: string }) => {
                        people.push(item.id)
                    }
                )
            }
            return people;
        }
        case MondayColumnType.PHONE:
            return JSON.parse(columnValue.value)?.phone ?? null;
        case MondayColumnType.RATING:
            return JSON.parse(columnValue.value)?.rating ?? null;
        case MondayColumnType.STATUS:
            return columnValue.label
        case MondayColumnType.TAGS:
            return columnValue.tags.map((item: { name: string }) => item.name);
        case MondayColumnType.TEXT:
            return JSON.parse(columnValue.value);
        case MondayColumnType.TIMELINE: {
            if (isEmpty(columnValue.value)) {
                return null
            }
            const timeline = JSON.parse(columnValue.value)
            return {
                from: timeline.from,
                to: timeline.to,
            }
        }
        case MondayColumnType.TIME_TRACKING:
            return JSON.parse(columnValue.value)?.duration ?? null
        case MondayColumnType.VOTE:
            return columnValue.vote_count ?? 0;
        case MondayColumnType.WEEK: {
            return {
                start_date: columnValue.start_date,
                end_date: columnValue.end_date
            }
        }
        case MondayColumnType.WORLD_CLOCK:
            return columnValue.timezone ?? null;       
    }
}