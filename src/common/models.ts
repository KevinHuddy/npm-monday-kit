import { BoardKind, BoardState } from "./constants"

export type WorkspaceResponse = {
    data: { workspaces: Workspace[] }
    account_id: number
}

export interface Workspace {
    id: string
    name: string
}

export interface Group {
    id: string
    title: string
}

export interface SubItem {
    id: string
    board: Board
    group: Group
    subscribers: User[]
    name: string
    email: string
    created_at: string
    column_values: ColumnValue[]
}

export interface Item {
    id: string
    board: Board
    group: Group
    name: string
    email: string
    created_at: string
    column_values: ColumnValue[]
    subitems: SubItem[]
}

export interface ColumnValue {
    id: string
    type: string
    value: string
    text: string
    [key: string]: any
}

export interface Column {
    id: string
    title: string
    type: string
    settings_str: string
    description?: string
}

export interface Board {
    id: string
    board_kind: BoardKind
    columns: Column[]
    description: string
    groups: Group[]
    items_count: number
    items_page: { items: Item[] }
    name: string
    state: BoardState
    subscribers: User[]
    url: string
    workspace: Workspace
    workspace_id: string
    activity_logs: ActivityLog[]
}

export interface Update {
    body: string
    id: string
    created_at: string
    creator: {
        name: string
        id: string
    }
}

export interface User {
    id: string
    name: string
    email: string
    created_at: string
}

export type BoardResponse = {
    data: { boards: Board[] }
    account_id: number
}

export interface ActivityLog {
    account_id: string
    data: string
    entity: string
    id: string
    user_id: string
    created_at: string
}