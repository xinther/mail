<template>
  <el-scrollbar class="automation-page">
    <div class="automation-grid">
      <section class="settings-card labels-card">
        <div class="card-title">
          <div>
            <h2>{{ $t('labels') }}</h2>
            <p>{{ $t('labelsDesc') }}</p>
          </div>
        </div>
        <div class="label-create">
          <el-input v-model="newLabel.name" :placeholder="$t('labelName')" maxlength="30" @keyup.enter="createLabel"/>
          <el-color-picker v-model="newLabel.color"/>
          <el-button type="primary" :loading="labelSaving" @click="createLabel">{{ $t('add') }}</el-button>
        </div>
        <div class="label-list" v-loading="loading">
          <div class="label-row" v-for="item in labels" :key="item.labelId">
            <el-tag effect="plain" :color="`${item.color}12`" :style="{color: item.color, borderColor: item.color}">
              {{ item.name }}
            </el-tag>
            <el-button text type="danger" @click="removeLabel(item)">{{ $t('delete') }}</el-button>
          </div>
          <el-empty v-if="!loading && !labels.length" :image-size="80" :description="$t('noLabels')"/>
        </div>
      </section>

      <section class="settings-card rules-card">
        <div class="card-title">
          <div>
            <h2>{{ $t('mailRules') }}</h2>
            <p>{{ $t('mailRulesDesc') }}</p>
          </div>
          <el-button type="primary" @click="openCreateRule">{{ $t('addRule') }}</el-button>
        </div>
        <el-table :data="rules" v-loading="loading" class="rules-table" empty-text=" ">
          <el-table-column prop="name" :label="$t('ruleName')" min-width="150"/>
          <el-table-column :label="$t('condition')" min-width="230">
            <template #default="{row}">
              <span>{{ fieldText(row.field) }} · {{ operatorText(row.operator) }} · {{ row.value }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('ruleAction')" min-width="130">
            <template #default="{row}">{{ actionText(row) }}</template>
          </el-table-column>
          <el-table-column :label="$t('enabled')" width="80" align="center">
            <template #default="{row}">
              <el-switch v-model="row.enabled" :active-value="1" :inactive-value="0" @change="saveToggle(row)"/>
            </template>
          </el-table-column>
          <el-table-column width="110" align="right">
            <template #default="{row}">
              <el-button text type="primary" @click="openEditRule(row)">{{ $t('change') }}</el-button>
              <el-button text type="danger" @click="removeRule(row)">{{ $t('delete') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!loading && !rules.length" :image-size="90" :description="$t('noRules')"/>
      </section>
    </div>

    <el-dialog v-model="ruleDialog" :title="$t(ruleForm.ruleId ? 'editRule' : 'addRule')" width="520px" destroy-on-close>
      <el-form label-position="top" @submit.prevent>
        <el-form-item :label="$t('ruleName')">
          <el-input v-model="ruleForm.name" maxlength="50"/>
        </el-form-item>
        <div class="form-grid">
          <el-form-item :label="$t('matchField')">
            <el-select v-model="ruleForm.field">
              <el-option :label="$t('sender')" value="from"/>
              <el-option :label="$t('subject')" value="subject"/>
              <el-option :label="$t('recipient')" value="to"/>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('matchOperator')">
            <el-select v-model="ruleForm.operator">
              <el-option :label="$t('include')" value="contains"/>
              <el-option :label="$t('equal')" value="equals"/>
              <el-option :label="$t('startsWith')" value="startsWith"/>
              <el-option :label="$t('endsWith')" value="endsWith"/>
            </el-select>
          </el-form-item>
        </div>
        <el-form-item :label="$t('matchValue')">
          <el-input v-model="ruleForm.value" maxlength="200"/>
        </el-form-item>
        <div class="form-grid">
          <el-form-item :label="$t('ruleAction')">
            <el-select v-model="ruleForm.action">
              <el-option :label="$t('applyLabel')" value="label" :disabled="!labels.length"/>
              <el-option :label="$t('star')" value="star"/>
              <el-option :label="$t('moveToTrash')" value="trash"/>
              <el-option :label="$t('markAsRead')" value="markRead"/>
            </el-select>
          </el-form-item>
          <el-form-item v-if="ruleForm.action === 'label'" :label="$t('selectLabel')">
            <el-select v-model="ruleForm.labelId">
              <el-option v-for="item in labels" :key="item.labelId" :label="item.name" :value="item.labelId"/>
            </el-select>
          </el-form-item>
          <el-form-item v-else :label="$t('priority')">
            <el-input-number v-model="ruleForm.priority" :min="0" :max="999"/>
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialog = false">{{ $t('cancel') }}</el-button>
        <el-button type="primary" :loading="ruleSaving" @click="saveRule">{{ $t('save') }}</el-button>
      </template>
    </el-dialog>
  </el-scrollbar>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue';
import {useI18n} from 'vue-i18n';
import {labelAdd, labelDelete, labelList as fetchLabels} from '@/request/label';
import {mailRuleAdd, mailRuleDelete, mailRuleList, mailRuleUpdate} from '@/request/mail-rule';

const {t} = useI18n();
const loading = ref(false);
const labelSaving = ref(false);
const ruleSaving = ref(false);
const ruleDialog = ref(false);
const labels = ref([]);
const rules = ref([]);
const newLabel = reactive({name: '', color: '#409eff'});
const ruleForm = reactive(defaultRule());

onMounted(loadData);

function defaultRule() {
  return {ruleId: null, name: '', field: 'from', operator: 'contains', value: '', action: 'label', labelId: null, enabled: 1, priority: 0};
}

async function loadData() {
  loading.value = true;
  try {
    [labels.value, rules.value] = await Promise.all([fetchLabels(), mailRuleList()]);
  } finally {
    loading.value = false;
  }
}

async function createLabel() {
  if (!newLabel.name.trim() || labelSaving.value) return;
  labelSaving.value = true;
  try {
    labels.value.push(await labelAdd({...newLabel, name: newLabel.name.trim()}));
    newLabel.name = '';
  } finally {
    labelSaving.value = false;
  }
}

function removeLabel(item) {
  ElMessageBox.confirm(t('deleteLabelConfirm'), {type: 'warning', confirmButtonText: t('confirm'), cancelButtonText: t('cancel')})
      .then(async () => {
        await labelDelete(item.labelId);
        labels.value = labels.value.filter(label => label.labelId !== item.labelId);
        rules.value = rules.value.filter(rule => !(rule.action === 'label' && rule.labelId === item.labelId));
      });
}

function openCreateRule() {
  Object.assign(ruleForm, defaultRule(), {labelId: labels.value[0]?.labelId || null, action: labels.value.length ? 'label' : 'star'});
  ruleDialog.value = true;
}

function openEditRule(row) {
  Object.assign(ruleForm, row);
  ruleDialog.value = true;
}

async function saveRule() {
  if (!ruleForm.name.trim() || !ruleForm.value.trim() || ruleSaving.value) {
    ElMessage({message: t('completeRuleForm'), type: 'warning', plain: true});
    return;
  }
  ruleSaving.value = true;
  try {
    const form = {...ruleForm, name: ruleForm.name.trim(), value: ruleForm.value.trim()};
    const saved = form.ruleId ? await mailRuleUpdate(form) : await mailRuleAdd(form);
    const index = rules.value.findIndex(item => item.ruleId === saved.ruleId);
    if (index === -1) rules.value.push(saved); else rules.value[index] = saved;
    ruleDialog.value = false;
  } finally {
    ruleSaving.value = false;
  }
}

async function saveToggle(row) {
  try {
    await mailRuleUpdate({...row});
  } catch (error) {
    row.enabled = row.enabled ? 0 : 1;
    throw error;
  }
}

function removeRule(row) {
  ElMessageBox.confirm(t('deleteRuleConfirm'), {type: 'warning', confirmButtonText: t('confirm'), cancelButtonText: t('cancel')})
      .then(async () => {
        await mailRuleDelete(row.ruleId);
        rules.value = rules.value.filter(item => item.ruleId !== row.ruleId);
      });
}

const fieldText = field => ({from: t('sender'), subject: t('subject'), to: t('recipient')})[field] || field;
const operatorText = operator => ({contains: t('include'), equals: t('equal'), startsWith: t('startsWith'), endsWith: t('endsWith')})[operator] || operator;
function actionText(row) {
  if (row.action === 'label') return `${t('applyLabel')}: ${labels.value.find(item => item.labelId === row.labelId)?.name || '-'}`;
  return ({star: t('star'), trash: t('moveToTrash'), markRead: t('markAsRead')})[row.action] || row.action;
}
</script>

<style scoped lang="scss">
.automation-page { height: 100%; background: var(--extra-light-fill); }
.automation-grid { max-width: 1180px; margin: 0 auto; padding: 20px; display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 20px; }
.settings-card { background: var(--el-bg-color); border: 1px solid var(--el-border-color); border-radius: 6px; overflow: hidden; }
.card-title { min-height: 76px; padding: 16px 18px; border-bottom: 1px solid var(--el-border-color); display: flex; align-items: center; justify-content: space-between; gap: 16px; }
h2 { margin: 0; font-size: 16px; } p { margin: 5px 0 0; color: var(--regular-text-color); font-size: 12px; }
.label-create { padding: 16px; display: grid; grid-template-columns: 1fr auto auto; gap: 8px; }
.label-list { padding: 0 16px 16px; min-height: 180px; }
.label-row { min-height: 44px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--el-border-color-lighter); }
.rules-table { width: 100%; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
:deep(.el-select), :deep(.el-input-number) { width: 100%; }
@media (max-width: 900px) { .automation-grid { grid-template-columns: 1fr; padding: 15px; } }
@media (max-width: 560px) { .form-grid { grid-template-columns: 1fr; gap: 0; } .card-title { align-items: flex-start; } }
</style>
