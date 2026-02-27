const html = /* html */`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Environment Sync</title>
<style>
*,*::before,*::after{box-sizing:border-box;}
html,body{margin:0;padding:0;}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f6f6f9;min-height:100vh;color:#0f172a;}
.icon{display:inline-block;vertical-align:middle;flex-shrink:0;}
.max-w-cont{max-width:1200px;}
.max-w-md{max-width:28rem;}
.mx-auto{margin-left:auto;margin-right:auto;}
.w-full{width:100%;}
.w-dot{width:0.5rem;}
.h-dot{height:0.5rem;}
.h-48{height:12rem;}
.block{display:block;}
.inline-block{display:inline-block;}
.hidden{display:none!important;}
.flex{display:flex;}
.grid{display:grid;}
.flex-wrap{flex-wrap:wrap;}
.flex-col{flex-direction:column;}
.items-center{align-items:center;}
.justify-between{justify-content:space-between;}
.justify-center{justify-content:center;}
.justify-end{justify-content:flex-end;}
.grow{flex-grow:1;}
.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr));}
@media(min-width:1024px){
  .lg-grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr));}
  .lg-px-10{padding-left:2.5rem;padding-right:2.5rem;}
}
.gap-2{gap:0.5rem;}
.gap-3{gap:0.75rem;}
.gap-4{gap:1rem;}
.gap-6{gap:1.5rem;}
.p-2{padding:0.5rem;}
.p-3{padding:0.75rem;}
.p-4{padding:1rem;}
.p-5{padding:1.25rem;}
.p-6{padding:1.5rem;}
.px-3{padding-left:0.75rem;padding-right:0.75rem;}
.px-4{padding-left:1rem;padding-right:1rem;}
.px-8{padding-left:2rem;padding-right:2rem;}
.px-15{padding-left:0.375rem;padding-right:0.375rem;}
.px-25{padding-left:0.625rem;padding-right:0.625rem;}
.py-2{padding-top:0.5rem;padding-bottom:0.5rem;}
.py-25{padding-top:0.625rem;padding-bottom:0.625rem;}
.py-3{padding-top:0.75rem;padding-bottom:0.75rem;}
.py-05{padding-top:0.125rem;padding-bottom:0.125rem;}
.py-8{padding-top:2rem;padding-bottom:2rem;}
.pt-2{padding-top:0.5rem;}
.pt-10{padding-top:2.5rem;}
.pb-6{padding-bottom:1.5rem;}
.mt-1{margin-top:0.25rem;}
.mt-2{margin-top:0.5rem;}
.mt-3{margin-top:0.75rem;}
.mt-10{margin-top:2.5rem;}
.mt-16{margin-top:4rem;}
.mb-2{margin-bottom:0.5rem;}
.mb-4{margin-bottom:1rem;}
.mb-6{margin-bottom:1.5rem;}
.mb-8{margin-bottom:2rem;}
.mb-10{margin-bottom:2.5rem;}
.mb-15{margin-bottom:0.375rem;}
.ml-1{margin-left:0.25rem;}
.space-y-1>*+*{margin-top:0.25rem;}
.space-y-2>*+*{margin-top:0.5rem;}
.space-y-3>*+*{margin-top:0.75rem;}
.space-y-4>*+*{margin-top:1rem;}
.space-y-6>*+*{margin-top:1.5rem;}
.text-10{font-size:10px;}
.text-xs{font-size:0.75rem;line-height:1rem;}
.text-sm{font-size:0.875rem;line-height:1.25rem;}
.text-lg{font-size:1.125rem;line-height:1.75rem;}
.text-xl{font-size:1.25rem;line-height:1.75rem;}
.text-2xl{font-size:1.5rem;line-height:2rem;}
.font-medium{font-weight:500;}
.font-semibold{font-weight:600;}
.font-bold{font-weight:700;}
.tracking-tight{letter-spacing:-0.025em;}
.tracking-wider{letter-spacing:0.05em;}
.uppercase{text-transform:uppercase;}
.italic{font-style:italic;}
.leading-relaxed{line-height:1.625;}
.text-left{text-align:left;}
.text-center{text-align:center;}
.align-middle{vertical-align:middle;}
.font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;}
.text-white{color:#ffffff;}
.text-slate-300{color:#cbd5e1;}
.text-slate-400{color:#94a3b8;}
.text-slate-500{color:#64748b;}
.text-slate-600{color:#475569;}
.text-slate-700{color:#334155;}
.text-slate-800{color:#1e293b;}
.text-slate-900{color:#0f172a;}
.text-primary{color:#4945ff;}
.text-success{color:#328048;}
.text-warning{color:#d9822f;}
.text-danger{color:#d02b20;}
.text-neutral{color:#666687;}
.bg-white{background-color:#ffffff;}
.bg-slate-50{background-color:#f8fafc;}
.bg-slate-100{background-color:#f1f5f9;}
.bg-slate-600{background-color:#475569;}
.bg-slate-900{background-color:#0f172a;}
.bg-primary{background-color:#4945ff;}
.bg-success{background-color:#328048;}
.bg-primary-5{background-color:rgba(73,69,255,0.05);}
.bg-primary-10{background-color:rgba(73,69,255,0.1);}
.bg-success-10{background-color:rgba(50,128,72,0.1);}
.bg-warning-10{background-color:rgba(217,130,47,0.1);}
.bg-danger-10{background-color:rgba(208,43,32,0.1);}
.bg-dark-40{background-color:rgba(15,23,42,0.4);}
.border{border-width:1px;border-style:solid;}
.border-b{border-bottom-width:1px;border-bottom-style:solid;}
.border-r{border-right-width:1px;border-right-style:solid;}
.border-t{border-top-width:1px;border-top-style:solid;}
.border-2{border-width:2px;border-style:solid;}
.border-dashed{border-style:dashed;}
.border-slate-100{border-color:#f1f5f9;}
.border-slate-200{border-color:#e2e8f0;}
.border-slate-300{border-color:#cbd5e1;}
.border-slate-800{border-color:#1e293b;}
.border-primary{border-color:#4945ff;}
.border-success-20{border-color:rgba(50,128,72,0.2);}
.rounded{border-radius:0.25rem;}
.rounded-lg{border-radius:0.5rem;}
.rounded-xl{border-radius:0.75rem;}
.rounded-full{border-radius:9999px;}
.overflow-hidden{overflow:hidden;}
.overflow-y-auto{overflow-y:auto;}
.fixed{position:fixed;}
.inset-0{top:0;right:0;bottom:0;left:0;}
.z-50{z-index:50;}
.shadow-inner{box-shadow:inset 0 2px 4px 0 rgba(0,0,0,0.05);}
.shadow-2xl{box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);}
.shadow-lg{box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -4px rgba(0,0,0,0.1);}
.shadow-primary{box-shadow:0 10px 15px -3px rgba(73,69,255,0.2);}
.strapi-shadow{box-shadow:0 1px 4px 0 rgba(33,33,52,0.1);}
.divide-y>*+*{border-top-width:1px;border-top-style:solid;}
.divide-slate-100>*+*{border-color:#f1f5f9;}
.btn-opacity:hover{opacity:0.9;}
.btn-slate:hover{background-color:#e2e8f0;}
.link-underline:hover{text-decoration:underline;}
.group:hover .group-primary{color:#4945ff;}
.transition{transition:all 150ms cubic-bezier(0.4,0,0.2,1);}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
.animate-pulse{animation:pulse 2s cubic-bezier(0.4,0,0.6,1) infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.animate-spin{animation:spin 1s linear infinite;}
.focus-ring:focus{outline:none;box-shadow:0 0 0 2px rgba(73,69,255,0.4);}
.cursor-pointer{cursor:pointer;}
.backdrop-blur{backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);}
.opacity-50{opacity:0.5;}
.pointer-events-none{pointer-events:none;}
table{border-collapse:collapse;width:100%;}
th{text-align:left;}
input,select,button{font-family:inherit;font-size:inherit;}
button{cursor:pointer;border:none;background:none;}
select{appearance:auto;}
</style>
</head>
<body>
<div class="max-w-cont mx-auto px-4 py-8 lg-px-10">

  <!-- Header -->
  <header class="mb-8">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
      <div class="flex items-center gap-3">
        <div class="bg-primary-10 p-2 rounded-lg text-primary">
          <svg class="icon" style="width:1.875rem;height:1.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
        </div>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">Environment Sync</h1>
            <span class="px-25 py-05 rounded-full text-xs font-bold bg-success-10 text-success border border-success-20">MASTER</span>
          </div>
          <p class="text-sm text-neutral mt-1">Manage configuration and data flow across environments</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 strapi-shadow">
        <div class="flex items-center gap-2 px-3 border-r border-slate-200">
          <svg class="icon" style="width:1rem;height:1rem;color:#666687;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
            <path d="M18 9a9 9 0 0 1-9 9"/>
          </svg>
          <span id="current-branch" class="text-xs font-semibold text-slate-600">loading...</span>
        </div>
        <div class="flex items-center gap-2 px-3 border-r border-slate-200">
          <span id="last-commit" class="text-xs font-mono text-neutral">—</span>
        </div>
        <div class="flex items-center gap-2 px-3">
          <div id="sync-dot" class="w-dot h-dot rounded-full bg-slate-400"></div>
          <span id="sync-label" class="text-xs font-medium text-slate-600">Checking...</span>
        </div>
      </div>
    </div>
  </header>

  <!-- GitHub Token + Mode -->
  <div class="grid grid-cols-1 lg-grid-cols-2 gap-6 mb-10">

    <!-- GitHub Token Card -->
    <div class="bg-white rounded-xl border border-slate-200 strapi-shadow p-5">
      <h3 class="font-bold text-slate-800 flex items-center gap-2 mb-4">
        <svg class="icon text-primary" style="width:1.5rem;height:1.5rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        GitHub Token
      </h3>
      <div class="space-y-3">
        <div>
          <label class="block text-xs font-bold uppercase text-neutral mb-15 tracking-wider">Personal Access Token</label>
          <input id="github-token-input" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-sm focus-ring" style="outline:none;" type="password" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"/>
        </div>
        <button id="save-token-btn" class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm btn-opacity transition" style="border:none;cursor:pointer;">
          <svg class="icon" style="width:0.875rem;height:0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Save Token
        </button>
        <div id="token-status" class="text-xs text-neutral">Checking...</div>
      </div>
    </div>

    <!-- Sync Role -->
    <div class="bg-white rounded-xl border border-slate-200 strapi-shadow p-5">
      <h3 class="font-bold text-slate-800 flex items-center gap-2 mb-4">
        <svg class="icon text-primary" style="width:1.5rem;height:1.5rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
        </svg>
        Sync Role
      </h3>
      <div class="space-y-3">
        <select class="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-25 text-sm focus-ring transition" style="outline:none;">
          <option selected value="master">Master (Source of Truth)</option>
          <option value="slave">Slave (Receiver)</option>
        </select>
        <p class="text-sm text-neutral italic">
          <span class="font-bold text-primary">Master:</span> This environment is the source of truth. Commit schemas and push to distribute to other environments.
        </p>
      </div>
    </div>
  </div>

  <!-- Master Panel -->
  <div class="grid grid-cols-1 lg-grid-cols-2 gap-6 mb-10">

    <!-- Commit Schema Card -->
    <div class="bg-white rounded-xl border border-slate-200 strapi-shadow overflow-hidden flex flex-col">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <h3 class="font-bold text-slate-800 flex items-center gap-2">
          <svg class="icon text-primary" style="width:1.5rem;height:1.5rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
            <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
            <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
          </svg>
          Commit Schema
        </h3>
        <button id="refresh-status-btn" title="Refresh status" class="text-neutral btn-opacity transition" style="border:none;background:none;cursor:pointer;padding:0.25rem;">
          <svg class="icon" style="width:1rem;height:1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
        </button>
      </div>
      <div class="p-5 space-y-4 grow">
        <div>
          <label class="block text-xs font-bold uppercase text-neutral mb-15 tracking-wider">Commit Message</label>
          <input id="commit-message" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-sm focus-ring" style="outline:none;" placeholder="e.g. feat: updated products schema" type="text"/>
        </div>
        <div class="border rounded-lg border-slate-200 overflow-hidden">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-50 text-neutral text-xs uppercase">
              <tr>
                <th class="px-4 py-2 font-bold" style="width:60px;">State</th>
                <th class="px-4 py-2 font-bold">File Path</th>
              </tr>
            </thead>
            <tbody id="status-tbody" class="divide-y divide-slate-100">
              <tr><td colspan="2" class="px-4 py-4 text-xs text-neutral text-center">Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="p-4 bg-slate-50 flex justify-end">
        <button id="commit-btn" class="flex items-center gap-2 bg-success text-white px-4 py-2 rounded-lg font-bold text-sm btn-opacity transition" style="border:none;cursor:pointer;">
          <svg class="icon" style="width:0.875rem;height:0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
          </svg>
          Commit Changes
        </button>
      </div>
    </div>

    <!-- Push to Remote + Backup -->
    <div class="space-y-6">

      <!-- Push to Remote -->
      <div class="bg-white rounded-xl border border-slate-200 strapi-shadow p-5">
        <h3 class="font-bold text-slate-800 flex items-center gap-2 mb-4">
          <svg class="icon text-primary" style="width:1.5rem;height:1.5rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
            <path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
          </svg>
          Push to Remote
        </h3>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold uppercase text-neutral mb-15 tracking-wider">Target Branch</label>
            <div class="flex items-center gap-2">
              <svg class="icon" style="width:1rem;height:1rem;flex-shrink:0;color:#666687;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                <path d="M18 9a9 9 0 0 1-9 9"/>
              </svg>
              <select id="branch-select" class="grow bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus-ring" style="outline:none;">
                <option value="">Loading branches...</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end">
            <button id="push-btn" class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm btn-opacity transition" style="border:none;cursor:pointer;">
              <svg class="icon" style="width:0.875rem;height:0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Push Code
            </button>
          </div>
        </div>
      </div>

      <!-- Data Backup -->
      <div class="bg-white rounded-xl border border-slate-200 strapi-shadow p-5">
        <h3 class="font-bold text-slate-800 flex items-center gap-2 mb-4">
          <svg class="icon text-primary" style="width:1.5rem;height:1.5rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="12" x2="2" y2="12"/>
            <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
            <line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/>
          </svg>
          Data Backup
        </h3>
        <div class="space-y-4">
          <label class="flex items-center gap-3 cursor-pointer">
            <input id="exclude-media-cb" type="checkbox" style="width:1rem;height:1rem;accent-color:#4945ff;"/>
            <span class="text-sm text-slate-700">Exclude media files (images, videos)</span>
          </label>
          <button id="create-backup-btn" class="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm btn-slate transition" style="border:none;cursor:pointer;">
            <svg id="backup-btn-icon" class="icon" style="width:0.875rem;height:0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Create Backup
          </button>
          <div class="pt-2">
            <div class="flex items-center justify-between mb-2">
              <p class="text-10 font-bold uppercase text-neutral">Recent Backups</p>
              <button id="refresh-backups-btn" title="Refresh" class="text-neutral btn-opacity" style="border:none;background:none;cursor:pointer;padding:0.125rem;">
                <svg class="icon" style="width:0.75rem;height:0.75rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M3 21v-5h5"/>
                </svg>
              </button>
            </div>
            <div id="backup-list" class="space-y-2">
              <p class="text-xs text-neutral text-center py-2">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Log Console -->
  <section class="mt-10">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <svg class="icon" style="width:1.5rem;height:1.5rem;color:#666687;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
        </svg>
        Sync Logs
      </h3>
      <button id="clear-logs-btn" class="text-xs font-bold text-primary link-underline" style="border:none;cursor:pointer;background:none;">Clear Logs</button>
    </div>
    <div id="log-console" class="bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-y-auto h-48 space-y-1 shadow-inner">
      <p class="text-slate-500">[init] <span class="text-success">INFO:</span> Environment Sync plugin loaded.</p>
    </div>
  </section>
</div>

<!-- Confirmation Modal -->
<div class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-40 backdrop-blur" id="sync-modal">
  <div class="bg-white w-full rounded-xl shadow-2xl border border-slate-200 overflow-hidden" style="max-width:28rem;">
    <div class="p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="p-2 bg-danger-10 rounded-lg text-danger">
          <svg class="icon" style="width:1.5rem;height:1.5rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h2 class="text-lg font-bold text-slate-800">Confirm Push</h2>
      </div>
      <p class="text-sm text-neutral leading-relaxed">
        This will push branch <span id="modal-branch-name" class="font-bold text-slate-800"></span> to the remote repository using your saved GitHub token. Are you sure?
      </p>
    </div>
    <div class="p-4 bg-slate-50 flex justify-end gap-3">
      <button id="close-modal" class="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 btn-slate transition" style="border:none;cursor:pointer;">Cancel</button>
      <button id="confirm-push-btn" class="px-4 py-2 rounded-lg text-sm font-bold text-white btn-opacity transition" style="background:#4945ff;border:none;cursor:pointer;">Push Now</button>
    </div>
  </div>
</div>

<script>
  const API_BASE = '/environment-sync';

  // ─── Helpers ───────────────────────────────────────────────────────────────

  async function apiGet(path) {
    const res = await fetch(API_BASE + path);
    return res.json();
  }

  async function apiPost(path, body) {
    const res = await fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  function addLog(level, message) {
    const el = document.getElementById('log-console');
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const colors = { INFO: '#328048', ERROR: '#d02b20', WARN: '#d9822f', DEBUG: '#cbd5e1' };
    const p = document.createElement('p');
    p.style.cssText = 'margin:0;color:#64748b;';
    p.innerHTML = \`[\${ts}] <span style="color:\${colors[level] || '#94a3b8'};font-weight:600;">\${level}:</span> \${message}\`;
    el.appendChild(p);
    el.scrollTop = el.scrollHeight;
  }

  function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.style.opacity = loading ? '0.6' : '1';
    btn.style.cursor = loading ? 'wait' : 'pointer';
  }

  // ─── Git Status ────────────────────────────────────────────────────────────

  async function loadStatus() {
    const tbody = document.getElementById('status-tbody');
    tbody.innerHTML = '<tr><td colspan="2" class="px-4 py-4 text-xs text-neutral text-center">Loading...</td></tr>';
    try {
      const data = await apiGet('/git/status');
      if (data.error) {
        tbody.innerHTML = \`<tr><td colspan="2" class="px-4 py-3 text-xs text-danger text-center">\${data.error}</td></tr>\`;
        addLog('ERROR', data.error);
        return;
      }
      if (data.files && data.files.length > 0) {
        const stateColors = {
          M: 'background:rgba(217,130,47,0.1);color:#d9822f;',
          A: 'background:rgba(50,128,72,0.1);color:#328048;',
          D: 'background:rgba(208,43,32,0.1);color:#d02b20;',
          '?': 'background:rgba(102,102,135,0.1);color:#666687;',
        };
        tbody.innerHTML = data.files.map(f => {
          const s = f.state[0];
          const style = stateColors[s] || stateColors['?'];
          return \`<tr>
            <td class="px-4 py-2"><span style="font-size:10px;font-weight:700;padding:0.125rem 0.375rem;border-radius:0.25rem;\${style}">\${f.state}</span></td>
            <td class="px-4 py-2 text-xs font-mono text-slate-600" style="word-break:break-all;">\${f.path}</td>
          </tr>\`;
        }).join('');
        document.getElementById('sync-dot').style.backgroundColor = '#d9822f';
        document.getElementById('sync-label').textContent = \`\${data.files.length} change(s) pending\`;
        addLog('INFO', \`Git status: \${data.files.length} file(s) changed\`);
      } else {
        tbody.innerHTML = '<tr><td colspan="2" class="px-4 py-4 text-xs text-center" style="color:#666687;">Working tree clean — nothing to commit</td></tr>';
        document.getElementById('sync-dot').style.backgroundColor = '#328048';
        document.getElementById('sync-label').textContent = 'Everything synced';
        addLog('INFO', 'Working tree is clean');
      }
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="2" class="px-4 py-3 text-xs text-danger text-center">Could not reach API</td></tr>';
      addLog('ERROR', 'Could not connect to plugin API: ' + e.message);
    }
  }

  // ─── Branches ─────────────────────────────────────────────────────────────

  async function loadBranches() {
    const select = document.getElementById('branch-select');
    try {
      const data = await apiGet('/git/branches');
      if (data.branches && data.branches.length > 0) {
        select.innerHTML = data.branches.map(b =>
          \`<option value="\${b.name}" \${b.current ? 'selected' : ''}>\${b.name}\${b.current ? ' (current)' : ''}</option>\`
        ).join('');
        const current = data.branches.find(b => b.current);
        if (current) {
          document.getElementById('current-branch').textContent = current.name;
        }
        addLog('DEBUG', \`Loaded \${data.branches.length} branch(es)\`);
      } else {
        select.innerHTML = '<option value="">No branches found</option>';
      }
    } catch (e) {
      select.innerHTML = '<option value="">Could not load branches</option>';
      addLog('ERROR', 'Could not load branches: ' + e.message);
    }
  }

  // ─── Token Settings ────────────────────────────────────────────────────────

  async function loadSettings() {
    try {
      const data = await apiGet('/settings');
      const el = document.getElementById('token-status');
      if (data.hasToken) {
        el.innerHTML = \`<span style="color:#328048;">&#10003; Token saved: <code>\${data.tokenMasked}</code></span>\`;
      } else {
        el.innerHTML = '<span style="color:#666687;">No token saved yet</span>';
      }
    } catch (e) {
      document.getElementById('token-status').textContent = 'Could not load settings';
    }
  }

  document.getElementById('save-token-btn').addEventListener('click', async () => {
    const input = document.getElementById('github-token-input');
    const token = input.value.trim();
    if (!token) { addLog('WARN', 'Token input is empty'); return; }
    const btn = document.getElementById('save-token-btn');
    setLoading(btn, true);
    addLog('DEBUG', 'Saving GitHub token...');
    try {
      const data = await apiPost('/settings/token', { token });
      if (data.success) {
        input.value = '';
        addLog('INFO', 'GitHub token saved successfully');
        loadSettings();
      } else {
        addLog('ERROR', data.error || 'Failed to save token');
      }
    } catch (e) {
      addLog('ERROR', 'Could not reach API: ' + e.message);
    } finally {
      setLoading(btn, false);
    }
  });

  // ─── Commit ────────────────────────────────────────────────────────────────

  document.getElementById('commit-btn').addEventListener('click', async () => {
    const msg = document.getElementById('commit-message').value.trim();
    if (!msg) { addLog('WARN', 'Please enter a commit message'); return; }
    const btn = document.getElementById('commit-btn');
    setLoading(btn, true);
    addLog('INFO', \`Staging all changes and committing: "\${msg}"\`);
    try {
      const data = await apiPost('/git/commit', { message: msg });
      if (data.success) {
        document.getElementById('commit-message').value = '';
        addLog('INFO', data.output || 'Commit successful');
        loadStatus();
      } else {
        addLog('ERROR', data.error || 'Commit failed');
      }
    } catch (e) {
      addLog('ERROR', 'Could not reach API: ' + e.message);
    } finally {
      setLoading(btn, false);
    }
  });

  // ─── Push (with confirm modal) ─────────────────────────────────────────────

  const modal = document.getElementById('sync-modal');
  document.getElementById('push-btn').addEventListener('click', () => {
    const branch = document.getElementById('branch-select').value;
    if (!branch) { addLog('WARN', 'Please select a branch first'); return; }
    document.getElementById('modal-branch-name').textContent = branch;
    modal.classList.remove('hidden');
  });
  document.getElementById('close-modal').addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

  document.getElementById('confirm-push-btn').addEventListener('click', async () => {
    const branch = document.getElementById('branch-select').value;
    if (!branch) { addLog('WARN', 'No branch selected'); return; }
    modal.classList.add('hidden');
    const btn = document.getElementById('push-btn');
    setLoading(btn, true);
    addLog('INFO', \`Pushing branch "\${branch}" to remote origin...\`);
    try {
      const data = await apiPost('/git/push', { branch });
      if (data.success) {
        addLog('INFO', data.output || \`Pushed "\${branch}" successfully\`);
        document.getElementById('sync-dot').style.backgroundColor = '#328048';
        document.getElementById('sync-label').textContent = 'Everything synced';
        loadStatus();
      } else {
        addLog('ERROR', data.error || 'Push failed');
      }
    } catch (e) {
      addLog('ERROR', 'Could not reach API: ' + e.message);
    } finally {
      setLoading(btn, false);
    }
  });

  // ─── Backup ────────────────────────────────────────────────────────────────

  async function loadBackups() {
    const list = document.getElementById('backup-list');
    try {
      const data = await apiGet('/backup/list');
      if (!data.backups || data.backups.length === 0) {
        list.innerHTML = '<p class="text-xs text-neutral text-center py-2">No backups yet</p>';
        return;
      }
      list.innerHTML = data.backups.map(b => \`
        <div style="display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;padding:0.375rem 0.5rem;background:#f8fafc;border-radius:0.25rem;border:1px solid #f1f5f9;gap:0.5rem;">
          <div style="min-width:0;flex:1;">
            <p style="font-family:monospace;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="\${b.filename}">\${b.filename}</p>
            <p style="color:#666687;margin-top:1px;">\${b.size} &bull; \${b.ago}</p>
          </div>
          <div style="display:flex;gap:0.375rem;flex-shrink:0;">
            <a href="/environment-sync/backup/download/\${encodeURIComponent(b.filename)}" download="\${b.filename}"
               style="display:inline-flex;align-items:center;gap:0.25rem;background:#4945ff;color:#fff;padding:0.25rem 0.5rem;border-radius:0.25rem;font-weight:700;text-decoration:none;font-size:11px;">
              <svg style="width:0.75rem;height:0.75rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              DL
            </a>
            <button onclick="deleteBackup('\${b.filename}')"
              style="display:inline-flex;align-items:center;background:rgba(208,43,32,0.08);color:#d02b20;padding:0.25rem 0.5rem;border-radius:0.25rem;font-weight:700;border:none;cursor:pointer;font-size:11px;">
              &times;
            </button>
          </div>
        </div>
      \`).join('');
    } catch (e) {
      list.innerHTML = '<p class="text-xs text-danger text-center py-2">Could not load backups</p>';
    }
  }

  window.deleteBackup = async function(filename) {
    if (!confirm(\`Delete \${filename}?\`)) return;
    try {
      const res = await fetch(\`/environment-sync/backup/\${encodeURIComponent(filename)}\`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addLog('INFO', \`Deleted backup: \${filename}\`);
        loadBackups();
      } else {
        addLog('ERROR', data.error || 'Delete failed');
      }
    } catch (e) {
      addLog('ERROR', 'Could not delete backup: ' + e.message);
    }
  };

  document.getElementById('create-backup-btn').addEventListener('click', async () => {
    const excludeMedia = document.getElementById('exclude-media-cb').checked;
    const btn = document.getElementById('create-backup-btn');
    setLoading(btn, true);
    btn.textContent = 'Creating backup...';
    addLog('INFO', \`Creating backup\${excludeMedia ? ' (excluding media)' : ''}...\`);
    try {
      const data = await apiPost('/backup/create', { excludeMedia });
      if (data.success) {
        const details = [
          data.size,
          data.totalEntries != null ? \`\${data.totalEntries} entries\` : null,
          data.totalContentTypes != null ? \`\${data.totalContentTypes} content types\` : null,
          data.totalComponents != null ? \`\${data.totalComponents} components\` : null,
        ].filter(Boolean).join(', ');
        addLog('INFO', \`Backup created: \${data.filename} (\${details})\`);
        loadBackups();
      } else {
        addLog('ERROR', data.error || 'Backup failed');
      }
    } catch (e) {
      addLog('ERROR', 'Could not create backup: ' + e.message);
    } finally {
      setLoading(btn, false);
      btn.innerHTML = \`<svg class="icon" style="width:0.875rem;height:0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Create Backup\`;
    }
  });

  document.getElementById('refresh-backups-btn').addEventListener('click', loadBackups);

  // ─── Refresh & Clear ───────────────────────────────────────────────────────

  document.getElementById('refresh-status-btn').addEventListener('click', loadStatus);

  document.getElementById('clear-logs-btn').addEventListener('click', () => {
    document.getElementById('log-console').innerHTML = '';
  });

  // ─── Init ──────────────────────────────────────────────────────────────────

  loadStatus();
  loadSettings();
  loadBranches();
  loadBackups();
</script>
</body>
</html>`;

const HomePage = () => (
  <iframe
    srcDoc={html}
    style={{ width: '100%', height: '100vh', border: 'none', display: 'block' }}
    title="Environment Sync"
  />
);

export default HomePage;
