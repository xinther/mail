import http from '@/axios/index.js';

export function emailList(accountId, allReceive, emailId, timeSort, size, type) {
    return http.get('/email/list', {params: {accountId, allReceive, emailId, timeSort, size, type}})
}

export function emailSearch(keyword, emailId, size) {
    return http.get('/email/list', {
        params: {keyword, emailId, size, type: 'all', timeSort: 0, allReceive: 1, globalSearch: 1}
    })
}

export function emailDelete(emailIds) {
    return http.delete('/email/delete?emailIds=' + emailIds)
}

export function emailLatest(emailId, accountId, allReceive) {
    return http.get('/email/latest', {params: {emailId, accountId, allReceive}, noMsg: true, timeout: 35 * 1000})
}

export function emailRead(emailIds) {
    return http.put('/email/read', {emailIds})
}

export function trashList(emailId, size) {
    return http.get('/email/trash', {params: {emailId, size}})
}

export function emailRestore(emailIds) {
    return http.put('/email/restore', {emailIds})
}

export function emailDeleteForever(emailIds) {
    return http.delete('/email/deleteForever', {params: {emailIds: emailIds + ''}})
}

export function emailSend(form,progress) {
    return http.post('/email/send', form,{
        onUploadProgress: (e) => {
            progress(e)
        },
        noMsg: true
    })
}
