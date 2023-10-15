declare interface AdminPreviewForChat {
    name: string,
    messages: { content: string, user_id: string, date: Date }[],
    id: string,
    creation_date: Date
}