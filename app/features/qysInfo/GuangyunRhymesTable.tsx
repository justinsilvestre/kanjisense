import clsx from "clsx"
import { Fragment } from "react"

const RHYMES = `東-tōng 董-tōngˬ 送-sōngˎ 屋-ʾwōk / 翁-ʾwōng-(with_initial_影) 中-tiūng-(三等) 風-pūng-(三等,_labial_initials) 縮-ṣyūk-(入聲,_with_三等_and_二等_sibilants) 肉-nźwīk-(入聲三等) 福-pūk-(入聲,_labial_initials) 育-ẁīk
冬-tong 湩-tongˬ 宋-songˎ 沃-ʾok
模-mo 姥-moˬ 暮-moˎ / 烏-ʾwo-(with_initial_影)
泰-tʻāiˎ / 會-ghwāiˎ-(合口)
灰-khwai 賄-khwaiˬ 隊-dwaiˎ
咍-khai 海-khaiˬ 代-daiˎ
魂-ghwon 混-ghwonˬ 慁-ghwonˎ 沒-mwot
痕-ghon 很-ghonˬ 恨-ghonˎ 麧-ghot
寒-ghan 旱-ghanˬ 翰-ghan 曷-ghat
桓-ghwan 緩-ghwanˬ 換-ghwanˎ 末-mat
豪-ghau 晧-ghauˬ 号-ghauˎ
歌-ka 哿-kaˬ 箇-kaˎ
戈-kwa 果-kwaˬ 過-kwa / 鞾-khwȧ-(三等合口) 伽-gya-(三等開口)
唐-dang 蕩-dangˬ 宕-dangˎ 鐸-dak / 荒-khwang-(合口)
登-tŏng 等-taiˬ 嶝-tŏngˎ 德-tŏk / 弘-ghwŏng-(合口)
侯-ghou 厚-ghouˬ 候-ghouˎ
覃-dam 感-kamˬ 勘-kʻamˎ 合-ghap
談-dām 敢-kāmˬ 闞-kʻāmˎ 盍-ghāp
江-kạ̊ng 講-kạ̊ngˬ 絳-kạ̊ngˎ 覺-kạuˎ
佳-kạ̈ 蟹-ghạ̈ˬ 卦-kwạ̈ˎ / 媧-kwạ̈-(合口)
皆-kạ̈i 駭-ghạ̈iˬ 怪-kwạ̈iˎ / 乖-kwạ̈i-(合口)
夬-kwạˎ / 欼-tsʻwạˎ
刪-sạn 潸-sạn 諫-kạnˎ 鎋-ghạt / 撰-dzwạnˬ-(合口)
山-sạ̈n 産-sạ̈nˬ 襉-kạ̈nˎ 黠-ghạ̈t
肴-ghạu 巧-kʻạuˬ 效-ghạuˎ
麻-mạ 馬-mạˬ 禡-mạˎ / 遮-tśyạ-(三等) 瓜-kwạ-(合口)
庚-kạng 梗-kạngˬ 映-ʾẹngˬ 陌-mạk / 諻-khwạng-(合口) 明-mẹng-(三等) 兄-khwẹng-(三等合口)
耕-kạ̈ng 耿-kạ̈ngˬ 諍-tsạ̈ngˎ 麥-mạ̈k / 宏-ghwạ̈ng-(合口)
咸-ghạ̈m 豏-ghạ̈mˬ 陷-ghạ̈mˎ 洽-ghạ̈p
銜-ghạm 檻-ghạmˬ 鑑-kạm 狎-ghạp
齊-dzei 薺-dzī 霽-tseiˎ / 圭-kwei-(合口)
先-sen 銑-senˬ 霰-senˎ 屑-swot / 淵-ʾwen-(合口)
蕭-seu 篠-seuˬ 嘯-seuˎ
青-tsʻeng 迥-ghwengˬ 徑-kengˎ 錫-sek / 熒-ghweng-(合口)
添-tʻem 忝-tʻemˬ 㮇-tʻemˎ 怗-tʻep
支-tśï 紙-tśïˬ 寘-tśïˎ / 祇-gyï-(重紐四等) 危-ngwï-(合口) 隓-khẁï-(重紐四等合口) 吹-tśʻuï-(合口,_bimoraic_in_漢音)
脂-tśī 旨-tśīˬ 至-tśīˎ / 伊-ʾyī-(重紐四等) 龜-kwī-(合口) 葵-gẁī-(重紐四等合口) 追-tuī-(合口,_漢音_vowel_alternation)
之-tśi 止-tśiˬ 志-tśiˎ
微-mî 尾-mîˬ 未-mîˎ / 揮-khwî-(合口)
魚-ngyo 語-ngyoˬ 御-ngyoˎ
虞-ngu 麌-nguˬ 遇-nguˎ / 須-syu-(漢音_vowel_alternation)
祭-tsėiˎ / 藝-ngyeiˎ-(重紐四等) 歲-swėiˎ-(合口) 銳-ẁeiˎ-(initial_以)
廢-pâiˎ
宵-sėu 小-sėuˬ 笑-sėuˎ / 要-ʾyeu-(重紐四等)
尤-iū 有-iūˬ 宥-iūˎ / 浮-bū-(漢音_vowel_alternation)
幽-ʾiu 黝-ʾʾiuˬ 幼-ʾiuˎ
鍾-tśŷong 腫-tśŷongˬ 用-ŷongˎ 燭-tśŷok
真-tśīn 軫-tśīnˬ 震-tśīnˎ 質-tśīt / 因-ʾyīn-(重紐四等) 筠-wīn-(合口)
諄-tśyūn 準-tśyūnˬ 稕-tśyūnˎ 術-źyūt / 均-kẁīn-(重紐四等)
臻-tsịn 櫛-tsịt
文-mun 吻-munˬ 問-munˎ 物-mut
欣-khin 隱-ʾinˬ 焮-khinˎ 迄-khit
元-ngwên 阮-ngwên 願-ngwênˎ 月-ngwêt / 言-ngên-(開口) 飜-pʻân-(labial_initials)
仙-sėn 獮-sėnˬ 線-sėnˎ 薛-sėt / 篇-pʻyen-(重紐四等) 全-dzwėn-(合口) 娟-ʾẁen-(重紐四等)
陽-yang 養-yangˬ 漾-yangˎ 藥-yak / 房-bâng-(labial_and_retroflex_sibilant_initials) 王-wâng-(initial_from_影云以) 狂-gŷang-(合口)
清-tsʻėng 靜-dzėngˬ 勁-kyengˎ 昔-sėk / 名-myeng-(重紐四等) 騂-swėng-(合口) 傾-kẁeng-(重紐四等合口)
蒸-tśyŏng 拯-tśyŏngˬ 證-tśyŏngˎ 職-tśyŏk / 洫-khŷŏk 域-wĭk
侵-tsʻim 寑-tsʻimˬ 沁-tsʻimˎ 緝-tsʻip / 愔-ʾyim-(重紐四等)
鹽-yem 琰-yemˬ 豔-yemˎ 葉-yep / 廉-lėm-(三等)
嚴-ngêm 儼-ngêmˬ 釅-ngêmˎ 業-ngêp
凡-bâm 范-bâmˬ 梵-bâmˎ 乏-bâp`
  .split('\n')
  .map(line => line.split(' / '))
  .map(([rhymeCharacters, extra]) => {
    return {
      rhymeCharacters: rhymeCharacters
        .split(' ')
        .map(s => s.split('-')) as [string, string][],
      extra: extra ? extra.split(' ').map(s => s.split('-')) as ([string, string] | [string, string, string])[] : []
    }
  })


function isCharacterExtraGuangyun(character: string) {
  return character === '湩' || character === '麧'
}

export function GuangyunRhymesTable() {
  return (
    <section id="guangyun-rhymes-table">
      <h3>The 206 rhymes of the <i>Guangyun</i> transcribed</h3>
      <p>
        For those with prior knowledge of historical Chinese phonology, here is a reference table
        of the 206 rhymes of the <i>Guangyun</i> in the notation system used in Kanjisense.
      </p>
      <div className="flex flex-col items-center">
        {RHYMES.map((rhymesGroup, i) => {
          const { rhymeCharacters, extra } = rhymesGroup
          return (
            <Fragment key={i}>
              <div key={i} className="md:min-w-[24rem]">
                {rhymeCharacters.length === 1 ? <>
                  <div className="inline-block md:min-w-[6rem]"> </div>
                  <div className="inline-block md:min-w-[6rem]"> </div>
                </> : null}
                {rhymeCharacters.map(([character, romanized], j) => (
                  <div key={j} className="inline-block md:min-w-[6rem] p-2 md:p-0">
                    <span className={clsx("md:text-3xl text-xl block", {
                      'text-gray-400': isCharacterExtraGuangyun(character)
                    })}>{character}</span> <span className="md:text-xl">{romanized}</span>
                  </div>
                ))}
              </div>
              {extra.length > 0 ? <div className="min-w-[14rem] max-w-[24rem] mb-2 py-1 px-2 rounded-md border-yellow-800/30 border-solid border">
                variations in this group:{' '}
                {extra.map(([character, romanized, note], j) => (
                  <span key={j}>
                    <span className="">{character}</span> <span className="">{romanized}</span>{
                      note ? <span className=""> {note.replace(/_/g, ' ')}</span> : ''

                    }{j < extra.length - 1 ? <>,&nbsp;</> : ''}
                  </span>
                ))}
              </div> : null}
              {<><hr className="w-[21rem] bg-black/10 border-solid border border-black/10 h-px my-2" /></>}

            </Fragment>
          )
        })}
      </div>
    </section>
  )
}