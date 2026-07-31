import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:https';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { _electron as electron } from 'playwright';

const repoRoot = 'E:/0yuexia/0,月下PC';
const evidenceDir = path.join(repoRoot, 'artifacts', 'v7-setting-acceptance');
const userDataDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-v7-local-full-generation-'));
const require = createRequire(import.meta.url);
await mkdir(evidenceDir, { recursive: true });

const certificatePath = path.join(userDataDir, 'local-model.pfx');
const certificatePassword = 'xinyuexia-local-acceptance';
execFileSync('powershell.exe', [
  '-NoProfile',
  '-NonInteractive',
  '-Command',
  `$cert = New-SelfSignedCertificate -DnsName 'localhost' -CertStoreLocation 'Cert:\\CurrentUser\\My'; `
    + `$password = ConvertTo-SecureString '${certificatePassword}' -AsPlainText -Force; `
    + `Export-PfxCertificate -Cert $cert -FilePath '${certificatePath.replaceAll("'", "''")}' -Password $password | Out-Null; `
    + `Remove-Item -LiteralPath ("Cert:\\CurrentUser\\My\\" + $cert.Thumbprint) -Force`,
]);
const certificate = await readFile(certificatePath);

function characterOutput() {
  const createPerson = (name, roleType) => {
    const fields = [
    ['身份定位', roleType], ['人物姓名', name], ['外貌', '黑发黑眼，身形修长'],
    ['性格', '果断冷静'], ['称号', '吞天者'], ['别名', '阿渊'], ['人物出身', '边城少年'],
    ['人物经历', '家族受创后独自求道'], ['人物秘密', '体内封存古老吞噬印记'], ['当前目标', '进入上宗寻找真相'],
    ['核心动机', '保护亲友并掌控命运'], ['行为原则', '先判断代价再出手'], ['行为底线', '不伤及无辜'],
    ['语言习惯', '说话简短直接'], ['标志动作', '思考时轻敲刀柄'], ['角色已知信息', '吞噬能力可提纯灵力'],
    ['角色错误认知', '认为印记只是血脉异变'], ['金手指当前功能', '吞噬并提纯灵物'], ['金手指来源', '上古遗迹'],
    ['金手指升级方式', '吞噬更高阶法则结晶'], ['金手指解锁条件', '境界与神魂同步提升'], ['金手指使用限制', '每日承受上限受境界限制'],
    ['金手指使用代价', '过量使用会损伤经脉'], ['金手指真实来历', '破碎世界的核心权柄'], ['金手指隐藏目的', '选择新世界守护者'],
    ['金手指当前解锁状态', '解锁基础吞噬'], ['境界修为', '炼体三重'], ['功法体系', '吞元经'],
    ['战斗技能', '破山拳与追风步'], ['其他技能', '辨识灵材'], ['战力范围', '可越一个小境界作战'],
    ['自身弱点', '缺少远程手段'], ['当前处境', '被地方家族追查'], ['当前任务', '通过上宗入门考核'],
    ['当前风险', '吞噬印记可能暴露'], ['当前地点', '青山城'], ['身体状态', '轻伤恢复中'],
    ['精神状态', '警惕但坚定'], ['当前资源', '三枚灵石与一柄短刀'], ['人物关系', '与林青竹是幼时好友'], ['隶属势力', '暂无'],
    ];
    return ['<人物设定>', `*${name}*：`, ...fields.map(([key, value]) => `【${key}】：${value}`), '</人物设定>'].join('\n');
  };
  return [
    createPerson('林渊', '男主角'),
    createPerson('苏晚晴', '女主角'),
    createPerson('韩岳', '重要正派角色'),
    createPerson('血煞', '重要反派角色'),
  ].join('\n\n');
}

function buildOutput(requestBody, step) {
  const parsed = JSON.parse(requestBody || '{}');
  const prompt = (parsed.messages ?? []).map((message) => String(message.content ?? '')).join('\n');
  const blocks = prompt.match(/<([^<>\n]+)>\n\*[^\n]+\*：\n(?:【[^\n]+】：填写该字段内容\n?)+<\/\1>/g) ?? [];
  if (step?.includes('主角')) {
    assert(blocks.length > 0, 'character request should contain writable non-character setting skeletons');
    return [
      characterOutput(),
      blocks.join('\n\n').replaceAll('填写该字段内容', '本地全链路验收生成的具体设定内容'),
    ].join('\n\n');
  }
  assert(blocks.length > 0, 'request should contain writable setting skeletons');
  return blocks.join('\n\n').replaceAll('填写该字段内容', '本地全链路验收生成的具体设定内容');
}

const requestSteps = [];
const serverErrors = [];
const outputDiagnostics = [];
const server = createServer({ pfx: certificate, passphrase: certificatePassword }, (request, response) => {
  let body = '';
  request.on('data', (chunk) => { body += chunk.toString('utf8'); });
  request.on('end', () => {
    try {
      const parsed = JSON.parse(body || '{}');
      const prompt = (parsed.messages ?? []).map((message) => String(message.content ?? '')).join('\n');
      const step = prompt.match(/【当前生成步骤】\s*\n([^\n]+)/)?.[1]?.trim();
      requestSteps.push(step ?? '未识别');
      const output = buildOutput(body, step);
      outputDiagnostics.push({ length: output.length, preview: output.slice(0, 800) });
      setTimeout(() => {
        response.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        });
        response.end(JSON.stringify({ choices: [{ message: { content: output } }] }));
      }, 900);
    } catch (error) {
      serverErrors.push(error instanceof Error ? error.message : String(error));
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: { message: serverErrors.at(-1) } }));
    }
  });
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
assert(address && typeof address === 'object');
const baseUrl = `https://localhost:${address.port}/v1`;

let electronApp;
let page;
try {
  electronApp = await electron.launch({
    executablePath: require('electron'),
    cwd: repoRoot,
    args: [path.join(repoRoot, 'electron', 'main.cjs'), `--user-data-dir=${userDataDir}`],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      NODE_ENV: 'test',
      NODE_TLS_REJECT_UNAUTHORIZED: '0',
      XINYUEXIA_LOAD_DIST: '1',
      XINYUEXIA_SMOKE_HEADLESS: '1',
    },
    timeout: 30_000,
  });
  page = await electronApp.firstWindow({ timeout: 30_000 });
  await page.waitForLoadState('domcontentloaded');
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });
  const geometry = await electronApp.evaluate(({ BrowserWindow, screen }) => {
    const appWindow = BrowserWindow.getAllWindows()[0];
    const display = screen.getAllDisplays().find((item) => item.bounds.x === 2048);
    if (!display) return null;
    appWindow.setBounds({ x: display.workArea.x + 24, y: 20, width: display.workArea.width - 48, height: display.workArea.height - 40 });
    appWindow.show();
    return { bounds: appWindow.getBounds(), display: display.bounds, visible: appWindow.isVisible() };
  });
  assert(geometry?.visible && geometry.bounds.x >= 2048);

  const secret = await page.evaluate(async ({ modelBaseUrl }) => {
    localStorage.setItem('xinyuexia_application_mode_v1', 'standard');
    localStorage.setItem('xinyuexia_api_settings_v1', JSON.stringify({ models: [{
      id: 'v7-local-acceptance', instanceId: 'v7-local-acceptance-instance', name: '本地全链路验收模型',
      enabled: true, baseUrl: modelBaseUrl, apiKey: '', hasApiKey: true, model: 'v7-local-acceptance',
      provider: 'openai-compatible', temperature: 0.7,
    }] }));
    localStorage.setItem('xinyuexia_active_model_id', 'v7-local-acceptance');
    return window.xinyuexiaModelSecrets?.set('v7-local-acceptance-instance', 'local-only-key');
  }, { modelBaseUrl: baseUrl });
  assert.equal(secret?.ok, true);
  await page.reload();
  await page.getByText('作品概览', { exact: true }).waitFor({ timeout: 30_000 });

  await page.getByRole('button', { name: '新建小说' }).click();
  await page.locator('input:visible').last().fill('V7一键生成全链路验收');
  await page.getByRole('button', { name: /^确[定认]$/ }).last().click();
  const card = page.getByText('V7一键生成全链路验收', { exact: true }).last().locator('xpath=ancestor::article');
  await card.getByRole('button', { name: '进入标准工作台' }).click();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });
  const navigation = page.getByRole('navigation', { name: '标准模式创作导航' });
  await navigation.getByRole('button', { name: '作品设定', exact: true }).click();
  const actions = page.getByRole('group', { name: '作品设定操作' });
  await actions.waitFor({ timeout: 30_000 });
  await actions.getByRole('button', { name: '更换模板' }).click();
  const replacement = page.getByRole('dialog', { name: '更换设定模板？' });
  if (await replacement.isVisible().catch(() => false)) {
    await replacement.getByRole('button', { name: '继续更换模板' }).click();
  }
  await page.locator('[data-standard-setting-initializer="true"]').waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '选择内置模板：玄幻仙侠（轻量版）' }).click();
  await page.getByRole('button', { name: '确认模板并创建设定' }).click();
  const lightDomains = [
    ['作品设定', 7], ['剧情规划', 4], ['人物设定', 4], ['地点地图', 2],
    ['势力设定', 2], ['道具资源', 3], ['伏笔线索', 1], ['怪物图鉴', 1],
  ];
  for (const [domain, count] of lightDomains) {
    assert((await page.getByRole('button', { name: `${domain}${count}`, exact: true }).count()) === 1, `missing light domain or count: ${domain}${count}`);
  }
  await page.getByRole('button', { name: '道具资源3', exact: true }).click();
  await page.getByRole('button', { name: /^功法技能\d+$/ }).click();
  assert.equal(await page.getByLabel('设定名').inputValue(), '功法档案');
  assert.equal(await page.getByLabel('当前设定分组').inputValue(), '功法技能');
  assert.equal((await page.locator('body').innerText()).includes('（可重复）'), false);
  await page.screenshot({ path: path.join(evidenceDir, '06-light-redesigned-eight-domains.png') });
  const oneClick = page.getByRole('button', { name: '一键生成全部' });
  await oneClick.waitFor({ timeout: 30_000 });
  await page.getByLabel('作品设定用户要求').fill('东方玄幻升级流，主角果断，设定前后一致。');
  const expandedRequirementLayout = await page.evaluate(() => {
    const textarea = document.querySelector('[aria-label="作品设定用户要求"]')?.getBoundingClientRect();
    const brainstormButton = [...document.querySelectorAll('button')]
      .find((button) => button.textContent?.trim() === '脑洞')?.getBoundingClientRect();
    return textarea && brainstormButton
      ? { textareaHeight: textarea.height, textareaBottom: textarea.bottom, brainstormTop: brainstormButton.top, brainstormHeight: brainstormButton.height }
      : null;
  });
  assert(expandedRequirementLayout && expandedRequirementLayout.textareaHeight > 120);
  assert(expandedRequirementLayout.brainstormHeight >= 30);
  assert(expandedRequirementLayout.textareaBottom < expandedRequirementLayout.brainstormTop);
  await electronApp.evaluate(({ BrowserWindow }) => {
    BrowserWindow.getAllWindows()[0].setBounds({ x: 2072, y: 20, width: 2002, height: 760 });
  });
  await page.waitForTimeout(200);
  const compactRequirementLayout = await page.evaluate(() => {
    const textarea = document.querySelector('[aria-label="作品设定用户要求"]')?.getBoundingClientRect();
    const brainstormButton = [...document.querySelectorAll('button')]
      .find((button) => button.textContent?.trim() === '脑洞')?.getBoundingClientRect();
    return textarea && brainstormButton
      ? { textareaHeight: textarea.height, brainstormHeight: brainstormButton.height }
      : null;
  });
  assert(compactRequirementLayout && compactRequirementLayout.textareaHeight >= 96);
  assert(compactRequirementLayout.brainstormHeight >= 30);
  await electronApp.evaluate(({ BrowserWindow }) => {
    BrowserWindow.getAllWindows()[0].setBounds({ x: 2072, y: 20, width: 2002, height: 1065 });
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, '07-local-full-generation-before.png') });
  await oneClick.click();

  await page.getByRole('progressbar', { name: '作品设定生成进度' }).waitFor();
  await page.waitForFunction(() => {
    const progress = document.querySelector('[role="progressbar"][aria-label="作品设定生成进度"]')?.getAttribute('aria-valuenow');
    const failed = [...document.querySelectorAll('*')].some((node) => node.textContent?.trim() === '生成失败');
    return progress === '100' || failed;
  }, null, { timeout: 120_000 });
  assert.equal(await page.getByText('生成失败', { exact: true }).isVisible().catch(() => false), false, `server errors: ${serverErrors.join('; ')}`);
  assert.deepEqual(requestSteps, ['核心设定', '主角与金手指', '故事与首卷', '地点与势力', '功法与伏笔']);
  const persisted = await page.evaluate(() => {
    const templateKey = Object.keys(localStorage).find((key) => key.startsWith('xinyuexia_standard_setting_template_'));
    const novelId = templateKey?.slice('xinyuexia_standard_setting_template_'.length) ?? '';
    const library = JSON.parse(localStorage.getItem(`xinyuexia_workbench_settings_${novelId}`) ?? '[]');
    return {
      libraryCount: library.length,
      generatedCount: library.filter((entry) => String(entry.content).includes('本地全链路验收生成')).length,
      hasNamedCharacter: library.some((entry) => entry.title === '林渊'),
    };
  });
  assert(persisted.generatedCount > 8);
  assert.equal(persisted.hasNamedCharacter, true);
  assert.equal(await page.getByRole('button', { name: '重新生成' }).count(), 0);
  assert.equal(await page.getByRole('button', { name: '重新一键生成全部' }).count(), 1);
  await page.waitForTimeout(1_000);
  await page.screenshot({ path: path.join(evidenceDir, '08-local-full-generation-completed.png') });
  await page.getByRole('button', { name: '逐步生成' }).click();
  assert.equal(await page.getByRole('button', { name: '一键生成全部' }).count(), 0);
  assert((await page.getByRole('button', { name: '重新生成' }).count()) > 0);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(evidenceDir, '09-step-by-step-generation.png') });
  await page.getByRole('button', { name: '一键生成', exact: true }).click();
  await page.reload();
  await page.locator('[data-standard-mode-workbench="true"]').waitFor({ timeout: 30_000 });
  await navigation.getByRole('button', { name: '作品设定', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[role="progressbar"][aria-label="作品设定生成进度"]')?.getAttribute('aria-valuenow') === '100', null, { timeout: 30_000 });
  const selectTemplateAndReadSteps = async (templateName, expectedNames, expectedTechniqueTitle, screenshotName) => {
    const settingActions = page.getByRole('group', { name: '作品设定操作' });
    await settingActions.getByRole('button', { name: '更换模板' }).click();
    const replaceDialog = page.getByRole('dialog', { name: '更换设定模板？' });
    if (await replaceDialog.isVisible().catch(() => false)) {
      await replaceDialog.getByRole('button', { name: '继续更换模板' }).click();
    }
    await page.locator('[data-standard-setting-initializer="true"]').waitFor({ timeout: 30_000 });
    await page.getByRole('button', { name: `选择内置模板：${templateName}` }).click();
    await page.getByRole('button', { name: '确认模板并创建设定' }).click();
    const stepList = page.getByRole('list', { name: '作品设定生成步骤' });
    await stepList.waitFor({ timeout: 30_000 });
    const text = await stepList.innerText();
    for (const name of expectedNames) assert(text.includes(name), `${templateName} should show ${name}`);
    await page.getByRole('button', { name: /^道具资源\d+$/ }).click();
    await page.getByRole('button', { name: /^功法技能\d+$/ }).click();
    assert.equal(await page.getByLabel('设定名').inputValue(), expectedTechniqueTitle);
    assert.equal(await page.getByLabel('当前设定分组').inputValue(), '功法技能');
    await page.screenshot({ path: path.join(evidenceDir, screenshotName) });
    return expectedNames;
  };
  const standardSteps = await selectTemplateAndReadSteps(
    '玄幻仙侠（标准版）',
    ['世界规则与力量', '主角阵容与金手指', '全书剧情与节奏', '地图势力与关系', '功法资源与伏笔'],
    '功法档案（可重复）',
    '10-standard-template-generation-order.png',
  );
  const fullSteps = await selectTemplateAndReadSteps(
    '玄幻仙侠（完整版）',
    ['完整世界体系', '完整人物与金手指', '完整剧情规划', '完整地图与势力', '资源伏笔与怪物'],
    '功法档案（可重复）',
    '11-full-template-generation-order.png',
  );
  process.stdout.write(`${JSON.stringify({ pass: true, geometry, expandedRequirementLayout, compactRequirementLayout, requestSteps, persisted, standardSteps, fullSteps }, null, 2)}\n`);
} catch (error) {
  let rendererDiagnostics = null;
  if (page) {
    await page.screenshot({ path: path.join(evidenceDir, 'local-full-generation-failure.png') }).catch(() => {});
    rendererDiagnostics = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter((key) => key.includes('workbench_ai_sessions') || key.includes('background_ai') || key.includes('standard_setting_generation'));
      return Object.fromEntries(keys.map((key) => {
        const raw = localStorage.getItem(key) ?? '';
        if (key.includes('background_ai')) {
          const tasks = JSON.parse(raw || '[]');
          return [key, tasks.map((task) => ({ status: task.status, error: task.error, outputLength: String(task.output ?? '').length, outputPreview: String(task.output ?? '').slice(0, 400) }))];
        }
        return [key, { length: raw.length, preview: raw.slice(0, 1200) }];
      }));
    }).catch(() => null);
    process.stderr.write(`${(await page.locator('body').innerText().catch(() => '')).slice(0, 5000)}\n`);
  }
  process.stderr.write(`requestSteps=${JSON.stringify(requestSteps)} serverErrors=${JSON.stringify(serverErrors)} outputDiagnostics=${JSON.stringify(outputDiagnostics)} rendererDiagnostics=${JSON.stringify(rendererDiagnostics)}\n`);
  throw error;
} finally {
  if (electronApp) await electronApp.close().catch(() => {});
  await new Promise((resolve) => server.close(resolve));
  await rm(userDataDir, { recursive: true, force: true });
}
