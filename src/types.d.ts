interface Chat {
    id: string,
    name: string,
    messages: { user_id: string, content: string, date: number }[],
    creation_date: Date
}
