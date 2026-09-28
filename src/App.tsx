import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronRight, Flower2, Heart, Lightbulb, Pause, Play, RotateCcw, Settings2, Sprout, Trash2, Volume2, VolumeX, Grid2X2, Leaf } from 'lucide-react'
import { Picnic } from './games/Picnic'
import { Matching } from './games/Matching'
import { Baskets } from './games/Baskets'
import { TenFrame } from './games/TenFrame'
import { PackingShop } from './games/PackingShop'
import { NumberTrain } from './games/NumberTrain'
import { Pairing } from './games/Pairing'
import { Story } from './games/Story'
import { MakeTen } from './games/MakeTen'
import { bridges } from './regrouping'
import { AssistanceContext } from './assistance'
import { Dialog } from './components/Dialog'
import { levels, supportLabels, type LevelId } from './levels'
import { boundedTarget, type Support } from './learning'
import { cancelSpeech, cantoneseNumber, speak, useCantoneseAudio } from './audio'
import { clearProgress, emptyProgress, loadProgress, saveProgress, type Observation, type Settings } from './progress'
import './styles.css'

export default function App() {
  const [progress, setProgress] = useState(loadProgress)
  const [levelId, setLevelId] = useState<LevelId>('picnic')
  const [variant, setVariant] = useState(0)
  const [bridgeIndex, setBridgeIndex] = useState(0)
  const [pairTotal, setPairTotal] = useState(5)
  const [attempt, setAttempt] = useState(0)
  const [panel, setPanel] = useState<'parent' | 'pause' | 'activities' | null>(null)
  const [parentTab, setParentTab] = useState<'settings' | 'observations'>('settings')
  const [hints, setHints] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)
  const [storageOk, setStorageOk] = useState(true)
  const [clearRequested, setClearRequested] = useState(false)
  const recorded = useRef(false)
  const audioAvailable = useCantoneseAudio()
  const settings = progress.settings
  const level = levels.find(candidate => candidate.id === levelId)!
  const advanced = ['packing', 'bridge', 'orders', 'carrying', 'borrowing'].includes(levelId)
  const maximum = advanced ? 99 : ['pairing', 'make-ten', 'unpack', 'train'].includes(levelId) ? 20 : settings.maximum
  const target = levelId === 'pairing' ? pairTotal : variant === 0 ? 3 : boundedTarget(variant, maximum)
  const effectiveSupport = hints && settings.support === 'independent' ? 'assisted' : settings.support
  const prompt = levelId === 'picnic' ? `兔仔想食${cantoneseNumber(target)}粒士多啤梨，幫佢放上碟。` : level.prompt

  useEffect(() => { cancelSpeech(); return cancelSpeech }, [levelId, variant, attempt, panel])

  function reset(nextVariant = variant) {
    cancelSpeech(); setVariant(nextVariant); setAttempt(previous => previous + 1); setHints(0); setCompleted(false); setHintVisible(false); recorded.current = false
  }
  function choose(id: LevelId) { setLevelId(id); reset(0); setPanel(null) }
  function updateSettings(patch: Partial<Settings>) {
    const next = { ...progress, settings: { ...settings, ...patch, ...(patch.support === 'independent' ? { tally: false } : {}) } }
    setProgress(next); setStorageOk(saveProgress(next)); reset()
  }
  function observe(kind: Observation['kind'], result: string) {
    const taskId = levelId === 'bridge' ? bridges[bridgeIndex].id : `${levelId}-${variant}`
    const support = kind === 'naming' && result.includes('示範') ? 'modeled' : effectiveSupport
    const observation: Observation = { id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`, at: new Date().toISOString(), level: levelId, taskId, support, kind, result: `[${taskId}] ${result}`, hints, range: maximum, representation: 'objects' }
    const next = { ...progress, observations: [...progress.observations.slice(-59), observation] }
    setProgress(next); setStorageOk(saveProgress(next))
  }
  function onComplete() {
    setCompleted(true)
    if (!recorded.current) { recorded.current = true; observe('quantity', '完成本題物件操作') }
  }
  const gameProps = { target, maximum, variant, numerals: settings.numerals, support: effectiveSupport, onComplete, onMove: (total: number) => { if (settings.tally && effectiveSupport !== 'independent') speak(cantoneseNumber(total)) } }
  const activityButtons = levels.map((activity, index) => <button key={activity.id} className={`activity-button ${activity.id === levelId ? 'current' : ''}`} aria-current={activity.id === levelId ? 'page' : undefined} onClick={() => choose(activity.id)}><img src={`/images/${activity.image}.png`} alt="" /><span><small>{String(index + 1).padStart(2, '0')}</small><strong>{activity.title}</strong><em>{activity.subtitle}</em></span><ChevronRight size={17} /></button>)

  return <div className="app-shell">
    <header className="site-header"><button className="brand" onClick={event => { event.currentTarget.focus(); setPanel('activities') }} aria-label="兔仔數數小天地，揀活動"><img src="/images/rabbit.png" alt="" /><span>兔仔<span>數數小天地</span></span></button><div className="header-right"><span className="together"><Heart size={15} />慢慢嚟，一齊玩</span><button className="parent-button" onClick={event => { event.currentTarget.focus(); setPanel('parent') }}><Settings2 size={18} /><span>家長小天地</span></button></div></header>
    <div className="workspace"><aside className="sidebar"><div className="section-eyebrow"><Sprout size={16} />今日玩啲咩？</div><nav aria-label="遊戲活動">{activityButtons}</nav><div className="sidebar-bottom"><img src="/images/rabbit.png" alt="" /><p>每一小步，<br />都係新發現。</p><Flower2 size={22} /></div></aside>
      <main className="main-content"><div className="scene-heading"><div><div className="section-eyebrow">{level.group}<span className="eyebrow-line" /></div><h1>{level.title}</h1><p>{level.prompt}</p></div><div className="scene-tools"><button className="icon-button mobile-activities" onClick={event => { event.currentTarget.focus(); setPanel('activities') }} title="揀活動" aria-label="揀活動"><Grid2X2 /></button><button className="icon-button" onClick={() => reset()} title="再玩一次" aria-label="再玩一次"><RotateCcw size={19} /></button><button className="icon-button" onClick={event => { event.currentTarget.focus(); setPanel('pause') }} title="休息一陣" aria-label="休息一陣"><Pause size={19} /></button></div></div>
        <section className={`play-scene scene-${levelId}`} aria-label={level.title}><div className="scene-topline"><span className="session-label"><span />{supportLabels[effectiveSupport]}</span><button className="audio-button" disabled={!audioAvailable} title={audioAvailable ? '聽廣東話題目' : '呢部裝置未提供廣東話語音'} aria-label={audioAvailable ? '聽廣東話題目' : '廣東話語音未提供'} onClick={() => speak(prompt)}>{audioAvailable ? <Volume2 size={19} /> : <VolumeX size={19} />}</button></div>
          <img className="scene-companion" src="/images/rabbit.png" alt="等緊點心嘅兔仔" />
          <div className="game-mount" key={`${levelId}-${variant}-${attempt}`} inert={panel !== null}>
            <AssistanceContext value={() => { setHints(previous => previous + 1); cancelSpeech() }}>
            {levelId === 'picnic' && <Picnic {...gameProps} />}
            {levelId === 'matching' && <Matching {...gameProps} />}
            {levelId === 'baskets' && <Baskets {...gameProps} />}
            {levelId === 'frame' && <TenFrame {...gameProps} />}
            {levelId === 'train' && <NumberTrain {...gameProps} />}
            {levelId === 'story' && <Story {...gameProps} />}
            {levelId === 'pairing' && <Pairing {...gameProps} />}
            {levelId === 'make-ten' && <MakeTen {...gameProps} />}
            {(levelId === 'packing' || levelId === 'bridge' || levelId === 'unpack' || levelId === 'orders' || levelId === 'carrying' || levelId === 'borrowing') && <PackingShop {...gameProps} mode={levelId} bridgeIndex={bridgeIndex} />}
            </AssistanceContext>
          </div>
          <div className="scene-bottom"><button className="hint-button" onClick={() => { setHints(previous => previous + 1); setHintVisible(true); cancelSpeech() }}><Lightbulb size={17} />一齊諗吓</button><span className="scene-flower"><Flower2 size={22} /></span></div>
        </section>
        {hintVisible && <div className="hint-note" role="status"><Lightbulb size={19} /><span>{advanced || levelId === 'unpack' ? '一包入面有十粒。交換只改擺法；加入或拎走先會改總數。' : levelId === 'make-ten' ? '望吓第一個十格仲有幾個空位，再由另一邊搬過嚟。' : '逐件移開已經數過嘅物件，再望吓邊啲仲未數。大人可以先示範一件。'}</span><button className="text-button" onClick={() => setHintVisible(false)}>收起</button></div>}
        <div className="after-scene"><div className="physical-note"><span className="leaf-icon"><Leaf size={20} /></span><span><strong>小手玩，生活都玩</strong><p>{level.physical}</p></span></div><button className={completed ? 'next-button ready' : 'next-button'} onClick={() => reset(variant + 1)}>{completed ? '再發現一題' : '換一題'}<ArrowRight size={19} /></button></div>
        <footer className="page-footer"><span>一點好奇，一點陪伴。</span><span>親子數感遊戲 <span className="footer-dot">·</span> 留低探索嘅空間</span></footer>
      </main>
    </div>
    {panel === 'activities' && <Dialog title="揀個小天地" onClose={() => setPanel(null)}><div className="activity-picker">{activityButtons}</div></Dialog>}
    {panel === 'pause' && <Dialog title="休息一陣" onClose={() => setPanel(null)}><div className="pause-content"><img src="/images/rabbit.png" alt="休息緊嘅兔仔" /><p>兔仔喺度等你。</p><button className="primary" onClick={() => setPanel(null)}><Play size={20} />繼續玩</button><button className="text-button" onClick={() => { reset(); setPanel('activities') }}>離開呢一題</button></div></Dialog>}
    {panel === 'parent' && <Dialog title="家長小天地" onClose={() => { setPanel(null); setClearRequested(false) }}><div className="tabs" role="tablist" aria-label="家長面板"><button role="tab" aria-selected={parentTab === 'settings'} onClick={() => setParentTab('settings')}>陪玩設定</button><button role="tab" aria-selected={parentTab === 'observations'} onClick={() => setParentTab('observations')}>觀察手記</button></div>
      {parentTab === 'settings' && <div className="parent-content activity-settings"><label>跨十路線<select value={bridgeIndex} onChange={event => { setBridgeIndex(Number(event.target.value)); reset() }}>{bridges.map((bridge, index) => <option key={bridge.id} value={index}>{bridge.label}</option>)}</select></label><label>單雙配對數量<input aria-label="單雙配對數量" type="number" min={0} max={20} value={pairTotal} onChange={event => { const value = Number(event.target.value); if (Number.isInteger(value) && value >= 0 && value <= 20) { setPairTotal(value); reset() } }} /></label><p className="fine-print">以上只套用於相應活動。下面嘅 1–5／1–10 用於四個基礎活動同點心故事；進階活動按題庫範圍。</p><p className="fine-print">建議先有：{level.prerequisites.map(id => levels.find(item => item.id === id)?.title).join('、') || '唔需要先完成其他活動'}。活動冇鎖，唔代表已經掌握。</p></div>}
      {parentTab === 'settings' ? <div className="parent-content"><fieldset><legend>數量範圍</legend><div className="segmented">{([5, 10] as const).map(value => <button key={value} aria-pressed={settings.maximum === value} onClick={() => updateSettings({ maximum: value })}>1–{value}</button>)}</div><p>6–10 由你觀察後選擇，唔需要過關解鎖。</p></fieldset><fieldset><legend>今次點樣玩？</legend><div className="segmented">{(Object.keys(supportLabels) as Support[]).map(support => <button key={support} aria-pressed={settings.support === support} onClick={() => updateSettings({ support })}>{supportLabels[support]}</button>)}</div></fieldset><label className="toggle-line"><span>顯示題目數字<small>關閉後用點點表示數量</small></span><input type="checkbox" checked={settings.numerals} onChange={event => updateSettings({ numerals: event.target.checked })} /></label><label className="toggle-line"><span>跟住物件讀數<small>「自己試」時停用，唔提前讀出結果</small></span><input type="checkbox" checked={settings.tally} disabled={settings.support === 'independent' || !audioAvailable} onChange={event => updateSettings({ tally: event.target.checked })} /></label><div className="parent-note"><strong>{audioAvailable ? '已偵測到廣東話語音' : '未偵測到廣東話語音'}</strong><p>家長讀句：{prompt}</p><p>{audioAvailable ? '仍需喺真實 iPad 試聽口音、音量同播放權限。' : '可以由家長讀題陪玩；唔會自動改用普通話。'}</p></div><p className="fine-print">先試 5–8 分鐘，唔舒服就提早休息。可以指、搬、示範，唔使急住講答案。紀錄唔代表掌握程度或任何診斷。</p><div className="privacy-row"><span>只儲存喺呢個瀏覽器，唔會同步。{!storageOk && '目前無法儲存，仍可繼續玩。'}</span><button className="text-button danger" onClick={() => { if (!clearRequested) setClearRequested(true); else { clearProgress(); setProgress(emptyProgress()); reset(); setClearRequested(false) } }}><Trash2 size={16} />{clearRequested ? '確認清除紀錄及設定' : '清除本機資料'}</button></div></div> : <div className="parent-content"><h3>今次：{level.title}</h3><p className="fine-print">請按親眼觀察記錄；口頭表達唔會由遊戲點擊推斷。</p><div className="observation-buttons"><button onClick={() => observe('physical', '用實物做過同類活動')}>實物做過一次</button><button onClick={() => observe('naming', '未提示前自己講出數字')}>自己講出數字</button><button onClick={() => observe('naming', '示範後跟住講')}>示範後跟住講</button><button onClick={() => observe('recognition', '能把數字配對到數量')}>數字配到數量</button><button onClick={() => observe('comfort', '想停一停或需要休息')}>想停一停</button></div><div className="observation-list" aria-live="polite">{progress.observations.length ? [...progress.observations].reverse().map(record => <article key={record.id}><div><strong>{levels.find(candidate => candidate.id === record.level)?.title || record.level}</strong><time>{new Date(record.at).toLocaleString('zh-HK', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></div><p>{record.result}</p><small>{supportLabels[record.support]} · {record.kind === 'quantity' ? '物件操作' : '家長觀察'} · 提示 {record.hints} 次</small></article>) : <p className="empty-note">仲未有手記。慢慢玩，留低你見到嘅小發現。</p>}</div></div>}
    </Dialog>}
  </div>
}
