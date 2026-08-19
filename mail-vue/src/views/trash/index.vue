<template>
  <emailScroll
      ref="scroll"
      type="trash"
      :get-email-list="trashList"
      :email-delete="emailDeleteForever"
      :restore-emails="emailRestore"
      :show-account-icon="false"
      :show-star="false"
      @jump="jumpContent"
  />
</template>

<script setup>
import {ref} from 'vue';
import router from '@/router';
import emailScroll from '@/components/email-scroll/index.vue';
import {emailDeleteForever, emailRestore, trashList} from '@/request/email';
import {useEmailStore} from '@/store/email';

const emailStore = useEmailStore();
const scroll = ref(null);

function jumpContent(email) {
  emailStore.contentData.email = email;
  emailStore.contentData.delType = 'trash';
  emailStore.contentData.showUnread = false;
  emailStore.contentData.showStar = false;
  emailStore.contentData.showReply = false;
  router.push('/mail');
}
</script>
