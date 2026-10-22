<template>
  <section class="plugin-submission" aria-label="提交新插件">
    <div>
      <h2>也有一个插件想分享？</h2>
      <p>准备好源码和 GitHub Release 安装包，填写投稿表单即可，无需 Fork 或创建 PR。</p>
      <p class="submission-note">网页无需注册。提交 Issue 需要 GitHub 账号，维护者会在那里与你交流。</p>
    </div>
    <a class="action secondary" href="https://github.com/Lanpropro/DD_Monitor_Plugins/issues/new?template=plugin-submission.yml"
      target="_blank" rel="noopener noreferrer">提交新插件 <span aria-hidden="true">↗</span></a>
  </section>
</template>

<style scoped>
.plugin-submission { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 24px; margin-top: 32px; padding: 24px; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg-soft); }
.plugin-submission h2 { margin: 0 0 10px; font-size: 22px; line-height: 1.4; }
.plugin-submission p { margin: 0; color: var(--vp-c-text-2); font-size: 14px; line-height: 1.8; }
.plugin-submission .submission-note { margin-top: 6px; font-size: 13px; }
.plugin-submission .action { white-space: nowrap; }
@media (max-width: 760px) {
  .plugin-submission { grid-template-columns: 1fr; gap: 18px; padding: 22px; }
  .plugin-submission .action { justify-self: start; }
}
</style>
