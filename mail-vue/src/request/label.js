import http from '@/axios/index.js';

export const labelList = () => http.get('/label/list');
export const labelAdd = form => http.post('/label/add', form);
export const labelUpdate = form => http.put('/label/update', form);
export const labelDelete = labelId => http.delete('/label/delete', {params: {labelId}});
export const labelAttach = (emailIds, labelId) => http.post('/label/attach', {emailIds, labelId});
export const labelDetach = (emailIds, labelId) => http.delete('/label/detach', {params: {emailIds: emailIds + '', labelId}});
