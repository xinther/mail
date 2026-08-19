<template>
  <div class="search-view">
    <div class="search-summary">
      <Icon icon="iconoir:search" width="18" height="18"/>
      <span>{{ $t('searchResultsFor', {keyword}) }}</span>
    </div>
    <emailScroll
        ref="scroll"
        type="search"
        :get-email-list="getEmailList"
        :email-delete="emailDelete"
        :email-read="emailRead"
        :star-add="starAdd"
        :star-cancel="starCancel"
        :show-account-icon="false"
        show-unread
        @jump="jumpContent"
    />
  </div>
</template>

<script setup>
import {computed, ref, watch} from 'vue';
import {useRoute} from 'vue-router';
import router from '@/router';
import {Icon} from '@iconify/vue';
import emailScroll from '@/components/email-scroll/index.vue';
import {emailDelete, emailRead, emailSearch} from '@/request/email';
import {starAdd, starCancel} from '@/request/star';
import {useEmailStore} from '@/store/email';

const route = useRoute();
const emailStore = useEmailStore();
const scroll = ref(null);
const keyword = computed(() => String(route.query.q || '').trim());

watch(keyword, () => scroll.value?.refreshList());

function getEmailList(emailId, size) {
  if (!keyword.value) return Promise.resolve({list: [], total: 0, latestEmail: {emailId: 0}});
  return emailSearch(keyword.value, emailId, size);
}

function jumpContent(email) {
  emailStore.contentData.email = email;
  emailStore.contentData.delType = 'logic';
  emailStore.contentData.showUnread = true;
  emailStore.contentData.showStar = true;
  emailStore.contentData.showReply = true;
  router.push('/mail');
}
</script>

<style scoped lang="scss">
.search-view { height: 100%; display: grid; grid-template-rows: auto 1fr; }
.search-summary {
  min-height: 42px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--regular-text-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
  span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
}
</style>
