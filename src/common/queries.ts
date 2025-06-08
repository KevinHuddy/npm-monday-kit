// GraphQL Fragments
export const columnValuesFragment = `
fragment ColumnValuesFragment on ColumnValue 
{
    id
    type
    value
    text
    ... on ButtonValue {
        label
    }
    ... on MirrorValue {
        display_value
    }
    ... on WorldClockValue {
        timezone
    }
    ... on StatusValue {
        label
    }
    ... on FormulaValue {
        display_value
        column {
            settings_str
        }
    }
    ... on VoteValue {
        vote_count
    }
    ... on TagsValue {
        tags {
            name
        }
    }
    ... on BoardRelationValue {
        linked_item_ids
    }
    ... on DependencyValue {
        linked_item_ids
    }
    ... on WeekValue {
        start_date
        end_date
    }
}`;

// GraphQL Fragments
const userFrament = `
fragment UserFragment on User 
{
    id
    name
    email
    enabled
    is_admin
    url
    phone
    title
    birthday
    current_language
    created_at
    is_guest
    is_pending
    is_view_only
    is_verified
    last_activity
    mobile_phone
    photo_thumb
    photo_thumb_small
    photo_tiny
}`;

export const mondayGraphQLQueries = {
    listWorkspaces: `
    query listWorkspaces ($limit: Int) 
    {
        workspaces (limit: $limit) 
        {
            id
            name
        }
    }`,
    listWorkspaceBoards: `
    query listWorkspaceBoards($workspaceId: ID!) 
    {
        boards(workspace_ids: [$workspaceId], order_by: created_at) 
        {
            id
            name
            type
        }
    }`,
    listBoardItems: `
    ${columnValuesFragment}
    query listBoardItems($boardId: ID!, $columnIds: [String!]) 
    {
        boards(ids: [$boardId])
        {
            items_page(limit: 500)
            {
                cursor
                items {
                    id
                    name
                    board { id }
                    column_values(ids: $columnIds) {
                        ...ColumnValuesFragment
                    }
                }
            }
        }
    }`,
    listBoardGroups: `
    query listBoardGroups($boardId: ID!) 
    {
        boards(ids: [$boardId]) 
        {
            groups {
                id
                title
            }
        }
    }`,
    listBoardColumns: `
    query listBoardColumns($boardId: ID!) 
    {
        boards(ids: [$boardId]) 
        {
            columns {
                id
                title
                type
                settings_str
                description
            }
        }
    }`,
    listUsers: `
    query listUsers
    {
        users(newest_first: true) 
        {
            id
            name
            email
            created_at
        }
    }`,
    getUserById: `
    ${userFrament}
    query getUserById($userId: ID!)
    {
        users(ids: [$userId]) {
            ...UserFragment
        }
    }`,
    getUserByEmail: `
    ${userFrament}
    query getUserByEmail($email: String!)
    {
        users(emails: [$email]) {
            ...UserFragment
        }
    }`,
    getItem: `
    ${columnValuesFragment}
    query getItem($itemId: ID!, $columnIds: [String!])
    {
        items(ids: [$itemId]) {
            id
            name
            board { id }
            column_values(ids: $columnIds) {
                ...ColumnValuesFragment
            }
        }
    }`,
    listSubitems: `
    ${columnValuesFragment}
    query getSubitemsColumnValues($itemId: ID!, $columnIds: [String!])
    {
        items(ids: [$itemId]) 
        {
            subitems {
                id
                name
                board { id }
                column_values(ids: $columnIds) {
                    ...ColumnValuesFragment
                }
            }
        }
    }`,
    listItemsByColumnValues: `
    ${columnValuesFragment}
    query getItemsByColumnValues(
        $limit: Int,
        $boardId: ID!,
        $columns: [ItemsPageByColumnValuesQuery!],
        $columnIds: [String!]
    )
    {
        items_page_by_column_values(
            limit: $limit,
            board_id: $boardId,
            columns: $columns
        ) {
            items {
                id
                name
                board { id }
                column_values(ids: $columnIds) {
                    ...ColumnValuesFragment
                }
            }
        }
    }`,
    getItemByQueryParams: `
    ${columnValuesFragment}
    query getItemByQueryParams(
        $boardId: ID!, 
        $limit: Int, 
        $rules: [Rule!]
        $columnIds: [String!]
    )
    {
        boards(ids: [$boardId]) 
        {
            items_page(
                limit: $limit,
                query_params: {
                    rules: $rules
                }
            )
            {
                items {
                    id
                    name
                    board { id }
                    column_values(ids: $columnIds) {
                        ...ColumnValuesFragment
                    }
                }
            }
        }
    }`,
}