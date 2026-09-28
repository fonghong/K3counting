export const levels = [
  { id: 'picnic', title: '兔仔野餐', subtitle: '逐粒數・逐粒放', image: 'picnic', group: '數量小發現', prerequisites: [], prompt: '幫兔仔準備點心，逐粒放上碟。', physical: '拎幾粒積木，請小朋友送同樣數量畀你。' },
  { id: 'matching', title: '一兔一份', subtitle: '配一配・比一比', image: 'matching', group: '數量小發現', prerequisites: ['picnic'], prompt: '每隻兔仔分一粒，睇吓有冇剩低。', physical: '用公仔同積木一對一配對，再拉開距離睇吓。' },
  { id: 'baskets', title: '兩個小籃', subtitle: '分一分・合返埋', image: 'baskets', group: '數量小發現', prerequisites: ['picnic'], prompt: '將點心分入兩個籃，點樣分都得。', physical: '將同一堆積木分成兩堆，再合返埋。空嘅一邊都可以。' },
  { id: 'frame', title: '十格花園', subtitle: '五加幾・湊成十', image: 'frame', group: '數量小發現', prerequisites: ['picnic'], prompt: '喺花園放好點心，睇吓仲有幾多個空位。', physical: '畫兩行、每行五格，用樽蓋擺出同一個數。' },
  { id: 'train', title: '數字小火車', subtitle: '加一・減一', image: 'train', group: '數量會改變', prerequisites: ['picnic'], prompt: '兔仔上車落車，乘客有咩唔同？', physical: '用公仔排隊，由任意數量開始，再加一個或拎走一個。' },
  { id: 'story', title: '點心小故事', subtitle: '加入・拎走・差幾多', image: 'picnic', group: '數量會改變', prerequisites: ['baskets', 'train'], prompt: '聽吓兔仔嘅故事，用點心擺出嚟。', physical: '用積木演一次同樣故事，再請小朋友指一指變咗邊一部分。' },
  { id: 'pairing', title: '兩個好朋友', subtitle: '成雙・有單丁', image: 'matching', group: '獨立小支線', prerequisites: ['matching'], prompt: '兩粒一對，睇吓最後有冇一粒單丁。', physical: '用 0–20 件小物件兩件一對，打亂再配。零件亦冇單丁。' },
  { id: 'packing', title: '兔仔打包店', subtitle: '十個一・一個十', image: 'packing', group: '十位新發現', prerequisites: ['frame'], prompt: '每十粒積木可以打包成一個十。', physical: '將十枝棒綁成一包，再拆開數返十枝。打包前後總數不變。' },
  { id: 'bridge', title: '跨十小橋', subtitle: '29 之後・一小步', image: 'train', group: '十位新發現', prerequisites: ['packing', 'train'], prompt: '逐粒加，夠十就打包；每一步都望清楚。', physical: '用兩包十枝棒同七枝散棒，行 27→32。31→29 留待另一題分開試。' },
  { id: 'make-ten', title: '湊十花園', subtitle: '先湊十・再睇剩低', image: 'frame', group: '二十以內', prerequisites: ['frame', 'baskets', 'story'], prompt: '搬幾粒去第一個十格，砌出一個十。', physical: '畫兩個十格，搬動樽蓋但唔加入新樽蓋，例如 8+5。' },
  { id: 'unpack', title: '拆包分點心', subtitle: '一個十・拆成十粒', image: 'baskets', group: '二十以內', prerequisites: ['packing', 'story'], prompt: '散件唔夠分，可以拆開一包十粒。', physical: '由一包十枝同三枝開始，拎走五枝。先拆包，後拎走。' },
  { id: 'orders', title: '十位小訂單', subtitle: '十對十・一對一', image: 'packing', group: '一百以內', prerequisites: ['bridge', 'story'], prompt: '一包係十粒，照住訂單加入或拎走。', physical: '用十枝一包嘅棒，同散棒演出唔需要交換嘅加減。' },
  { id: 'carrying', title: '打包再出發', subtitle: '加起嚟・交換一個十', image: 'packing', group: '一百以內', prerequisites: ['orders', 'make-ten'], prompt: '加埋之後，十粒散件換成一包。', physical: '例如 27+15：先合併，再將十枝散棒綁起，總數冇變。' },
  { id: 'borrowing', title: '拆包再分配', subtitle: '先拆十・再拎走', image: 'baskets', group: '一百以內', prerequisites: ['orders', 'unpack'], prompt: '唔夠散件，先將一個十換成十個一。', physical: '例如 32−16 或 30−14：拆一包後，分別拎走十同一。' },
] as const
export type LevelId = typeof levels[number]['id']
export const supportLabels = { modeled: '大人示範', assisted: '一齊試', independent: '自己試' } as const