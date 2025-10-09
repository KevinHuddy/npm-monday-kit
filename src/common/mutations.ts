export const mondayGraphQLMutations = {
    createItem: `
    mutation createItem(
        $itemName: String!
        $boardId: ID!
        $groupId: String
        $columnValues: JSON
        $createLabels: Boolean
    ) {
        create_item(
            item_name: $itemName
            board_id: $boardId
            group_id: $groupId
            column_values: $columnValues
            create_labels_if_missing: $createLabels
        ) {
            id
        }
    }`,
    createSubitem: `
    mutation createSubitem(
        $parentItemId: ID!
        $itemName: String!
        $columnValues: JSON
        $createLabels: Boolean
    ) {
        create_subitem(
            parent_item_id: $parentItemId
            item_name: $itemName
            column_values: $columnValues
            create_labels_if_missing: $createLabels
        ) {
            id
            board {
                id
            }
        }
    }`,
    updateItem: `
    mutation updateItem(
        $itemId: ID!
        $boardId: ID!
        $columnValues: JSON!
        $createLabels: Boolean
    ) {
        change_multiple_column_values(
            item_id: $itemId
            board_id: $boardId
            column_values: $columnValues
            create_labels_if_missing: $createLabels
            createLabels
        ) {
            id
            name
        }
    }`,
    createColumn: `
    mutation createColumn(
        $boardId: ID!
        $columnTitle: String!
        $columnType: ColumnType!
    ) {
        create_column(
            board_id: $boardId
            title: $columnTitle
            column_type: $columnType
        ) {
            id
        }
    }`,
    createGroup: `
    mutation createGroup(
        $boardId: ID!
        $groupName: String!
    ) {
        create_group(
            board_id: $boardId
            group_name: $groupName
        ) {
            id
        }
    }`,
    createUpdate: `
    mutation createUpdate(
        $itemId: ID!
        $updateBody: String!
    ) {
        create_update(
            item_id: $itemId
            body: $updateBody
        ) {
            id
        }
    }`,
    deleteItem: `
    mutation deleteItem(
        $itemId: ID!
    ) {
        delete_item (item_id: $itemId) {
            id
        }
    }`
}