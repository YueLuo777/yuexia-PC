import { BrainCircuit, CheckCircle2, Cpu, Download, HardDrive, LockKeyhole, Sparkles, Workflow } from 'lucide-react';

const modelTiers = [
  {
    name: '月下AI·轻量',
    model: 'Qwen3 1.7B Q4',
    device: '8GB 内存，可无独显',
    download: '约1～1.5GB',
    memory: '约3～4GB',
    purpose: '分类、提取、摘要、明确的软件操作',
  },
  {
    name: '月下AI·标准',
    model: 'Qwen3 4B Q4',
    device: '16GB 内存',
    download: '约2.5～3GB',
    memory: '约5～7GB',
    purpose: '多条件指令、设定生成、短文本润色',
  },
  {
    name: '月下AI·增强',
    model: 'Qwen3 8B Q4',
    device: '16～32GB 内存，建议 6～8GB 显存',
    download: '约5～6GB',
    memory: '约9～14GB',
    purpose: '人物分析、剧情整理、较好的中文润色',
  },
  {
    name: '月下AI·专业',
    model: 'Qwen3 14B Q4',
    device: '32GB 内存，建议 12GB 以上显存',
    download: '约9～11GB',
    memory: '约18～26GB',
    purpose: '复杂创作、深度分析、多步骤要求',
  },
] as const;

const assistantJobs = [
  '一句话生成作品设定分类和子分类',
  '从正文提取人物、地点、势力、道具和事件',
  '生成章节梗概，把零散想法整理成结构化设定',
  '根据自然语言打开页面、查找、筛选、新建或移动资料',
  '检查人物或章节缺失的资料，辅助填写固定字段',
] as const;

const installSteps = [
  '用户先下载体积较小的月下写作安装包',
  '首次进入时检测 CPU、内存、显卡、显存和可用磁盘空间',
  '按配置推荐轻量、标准、增强或专业 AI，同时允许用户手动选择',
  '点击安装后自动下载，支持断点续传、进度、剩余时间和失败重试',
  '完成文件校验后原子安装，重启软件即可离线使用',
] as const;

const safeguards = [
  '模型只输出受约束的操作意图和参数，由软件校验后调用现有功能',
  '查询和打开页面可直接执行；新建、填写和移动要先显示预览',
  '删除、覆盖和批量修改必须明确确认，所有 AI 修改应支持撤销',
  '理解不清楚时不执行，要向用户追问缺失条件',
  'AI 进程独立运行，加载失败或崩溃不能影响月下写作的正常编辑',
] as const;

function SectionTitle({ icon: Icon, title, note }: { icon: typeof Sparkles; title: string; note: string }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-base font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
      </div>
    </div>
  );
}

export function BuiltInAiProductIdeaTestPage() {
  return (
    <div className="min-h-full overflow-y-auto bg-[#F5F7FA] p-5 text-slate-700">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5">
        <header className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                <BrainCircuit className="h-4 w-4" />
                未做·产品想法记录
              </div>
              <h1 className="mt-3 text-2xl font-black text-slate-950">月下写作内置免费 AI 助手</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                用户不需安装 Ollama、不需配置 API Key，由软件内置推理引擎、检测电脑配置、推荐并下载合适的模型。
                AI 既能生成轻量内容，也能将自然语言转成可预览、可确认、可撤销的软件操作。
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-right">
              <div className="text-xs font-bold text-amber-700">当前状态</div>
              <div className="mt-1 text-lg font-black text-amber-900">仅记录，尚未实现</div>
            </div>
          </div>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle
            icon={Sparkles}
            title="核心卖点"
            note="卖点不是单纯的 AI 聊天，而是无需 API、无按次费用、断网可用，并且真正能帮用户整理和操作小说工程。"
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {assistantJobs.map((job) => (
              <div key={job} className="rounded-lg border border-cyan-100 bg-cyan-50/60 p-4">
                <CheckCircle2 className="h-4 w-4 text-cyan-700" />
                <p className="mt-3 text-sm font-bold leading-6 text-slate-700">{job}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle
            icon={Cpu}
            title="一套软件，多个 AI 能力包"
            note="不拆成多个月下写作安装版；保持一套软件和统一引擎，模型按配置和需求单独下载。优先评估 Qwen3 + llama.cpp + GGUF Q4_K_M 方案。"
          />
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="grid grid-cols-[1.05fr_1fr_1.45fr_0.8fr_0.8fr_1.8fr] bg-slate-100 px-4 py-3 text-xs font-black text-slate-500">
              <span>能力包</span><span>候选模型</span><span>推荐配置</span><span>下载</span><span>运行内存</span><span>用途</span>
            </div>
            {modelTiers.map((tier) => (
              <div
                key={tier.name}
                className="grid grid-cols-[1.05fr_1fr_1.45fr_0.8fr_0.8fr_1.8fr] items-center border-t border-slate-100 px-4 py-3 text-xs leading-5"
              >
                <span className="font-black text-slate-900">{tier.name}</span>
                <span className="font-bold text-cyan-700">{tier.model}</span>
                <span>{tier.device}</span><span>{tier.download}</span><span>{tier.memory}</span><span>{tier.purpose}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              icon={Download}
              title="自动推荐与安装链路"
              note="用户不需知道模型地址、端口和量化格式，全部由月下写作完成。"
            />
            <div className="space-y-3">
              {installSteps.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-700 text-xs font-black text-white">{index + 1}</span>
                  <p className="text-sm font-bold leading-6 text-slate-700">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
              <HardDrive className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
              <p className="text-xs leading-5 text-slate-500">
                模型存入独立数据目录，软件升级时不重复下载。应支持暂停、续传、完整性校验、修复、卸载和自动降级。
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              icon={LockKeyhole}
              title="AI 操作安全边界"
              note="轻量模型可以理解明确要求，但不允许它绕过业务规则直接改数据。"
            />
            <div className="space-y-3">
              {safeguards.map((item) => (
                <div key={item} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <Workflow className="mt-1 h-4 w-4 shrink-0 text-cyan-700" />
                  <p className="text-sm font-bold leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-cyan-200 bg-cyan-50 p-4">
              <div className="text-xs font-black text-cyan-800">建议的执行链路</div>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-700">
                用户输入 → AI 识别意图与参数 → 软件校验 → 显示操作预览 → 用户确认 → 调用现有功能 → 支持撤销
              </p>
            </div>
          </section>
        </div>

        <section className="rounded-lg border border-dashed border-amber-300 bg-amber-50 px-5 py-4">
          <div className="text-sm font-black text-amber-900">实现前必须再确认</div>
          <p className="mt-2 text-xs leading-5 text-amber-800">
            候选模型的商业分发许可、Windows CPU/GPU 兼容性、真实中文指令成功率、下载源和带宽成本、隐私声明，以及模型失败不影响主程序的恢复机制。
          </p>
        </section>
      </div>
    </div>
  );
}
