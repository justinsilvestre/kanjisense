import { joyoKanji } from "./baseKanji";
import { joyoKanjiAddedIn2010 } from "./dic/joyoAddedIn2010";
import { kanjijumpForcedAtomicFigures } from "./dic/kanjijumpForcedAtomicFigures";
import { PatchedIds } from "./PatchedIds.server";

const simplifiedJoyo = joyoKanji.replaceAll(
  new RegExp(`[${joyoKanjiAddedIn2010}]`, "g"),
  "",
);

function encodeFigure(key: string) {
  return key.match(/^[A-Z]+-/) ? `&${key};` : key;
}

// TODO:
// - 牙 needs variant
// - 謎 needs double-dot variant of mayou
// - 肉 made with 内
// - 灼 right part has ichi. check leopard as well
// - CDP-8BF8 really not the same glyph as CDP-876E here (top stroke pokes out/doesn't):
//    .replaceIds("CDP-8BF8", "⿱&CDP-876E;十")
// - 鹽 maybe as 臨 with wrapping wo4
// - check left/right radical assignments are correct:
//     右友有左布厷絨
// - perhaps should have crown and not cover
//    睿, 雪 top part
// - 藤 should have 'pump', not 'water'
// - 录 has wrong "pig snout" - KVG is wrong, actually

// leaving alone for now:
// 朩 different in e.g. 術茶 (hane vs no hane)
// 小 different in e.g. 少絲 (hane vs no hane)
// 巸 left is not registered at all, but is not priority in kanjijump

export const patchIds = (patchedIds: PatchedIds) => {
  return (
    patchedIds
      .addIdsAfterTransforms(
        "GWS-U7680-08-VAR-001",
        "⿱丨&GWS-CDP-8B7C-VAR-001;",
      )
      .addAtomicIdsLine("GWS-CDP-8B7C-VAR-001") // 即
      .replaceIds("既", "⿰&GWS-U7680-08-VAR-001;旡")
      .replaceIds("鄕", "⿲乡皀⻏[GTKV]	⿲乡&GWS-U7680-08-VAR-001;⻏[J]") // careful for oozato
      .replaceIds("卿", "⿻卯&GWS-U7680-08-VAR-001;")
      .replaceIds("即", "⿰&GWS-CDP-8B7C-VAR-001;卩")
      .replaceIds("𩙿", "⿱亼&GWS-CDP-8B7C-VAR-001;")
      .replaceIds("節", "⿱竹&GWS-KOSEKI-033260;")
      .addIdsAfterTransforms("GWS-KOSEKI-033260", "⿰&GWS-U7680-08-VAR-001;卩")

      .addIdsAfterTransforms("GWS-U6715-05", "⿰月龹")
      .replaceManyIds([
        ["榺", "⿸&GWS-U6715-05;木"],
        ["塍", "⿸&GWS-U6715-05;土"],
        ["謄", "⿸&GWS-U6715-05;言"],
        ["賸", "⿸&GWS-U6715-05;貝"],
        ["黱", "⿸&GWS-U6715-05;黑"],
        ["勝", "⿸&GWS-U6715-05;力"],
        ["滕", "⿸&GWS-U6715-05;水"],
        ["縢", "⿸&GWS-U6715-05;糸"],
        ["騰", "⿸&GWS-U6715-05;馬"],
        ["螣", "⿸&GWS-U6715-05;虫"],
      ])

      .addIdsAfterTransforms("GWS-U3AC3-05", "⿰方𠂉")
      .replaceManyIds([
        ["旃", "⿸&GWS-U3AC3-05;丹"],
        ["施", "⿸&GWS-U3AC3-05;也"],
        ["㫍", "⿸&GWS-U3AC3-05;攸"],
        ["旞", "⿸&GWS-U3AC3-05;遂"],
        ["旐", "⿸&GWS-U3AC3-05;兆"],
        ["旖", "⿸&GWS-U3AC3-05;奇"],
        ["㫏", "⿸&GWS-U3AC3-05;要"],
        ["旒", "⿸&GWS-U3AC3-05;㐬"],
        ["斿", "⿸&GWS-U3AC3-05;子"],
        ["旆", "⿸&GWS-U3AC3-05;巿"],
        ["旂", "⿸&GWS-U3AC3-05;斤"],
        ["𣃘", "⿸&GWS-U3AC3-05;丨"],
        ["旅", "⿸&GWS-U3AC3-05;&CDP-8C66;"],
        ["旋", "⿸&GWS-U3AC3-05;疋"],
        ["族", "⿸&GWS-U3AC3-05;矢"],
        ["旜", "⿸&GWS-U3AC3-05;亶"],
        ["旝", "⿸&GWS-U3AC3-05;會"],
        ["旄", "⿸&GWS-U3AC3-05;毛"],
        ["𣄪", "⿸&GWS-U3AC3-05;𤐫"],
        ["旇", "⿸&GWS-U3AC3-05;皮"],
        ["𣄠", "⿸&GWS-U3AC3-05;猋"],
        ["旌", "⿸&GWS-U3AC3-05;生"],
        ["旗", "⿸&GWS-U3AC3-05;其"],
        ["旟", "⿸&GWS-U3AC3-05;與"],
        ["旛", "⿸&GWS-U3AC3-05;番"],
      ])

      .addIdsAfterTransforms("GWS-U2FF3-U5405-U2000E-U27607", "⿱&CDP-8CA3;𧘇")
      .replaceIds("囊", "⿳&CDP-8DDD;冖&GWS-U2FF3-U5405-U2000E-U27607;")

      .addIdsAfterTransforms("GWS-U5FAE-05-VAR-001", "⿲彳山攵")
      .addIdsAfterTransforms("GWS-U5FAE-05-VAR-002", "⿲彳⿱山一攵")
      .replaceManyIds([
        ["微", "⿵&GWS-U5FAE-05-VAR-002;儿"],
        ["徵", "⿵&GWS-U5FAE-05-VAR-002;壬"],
        ["幑", "⿵&GWS-U5FAE-05-VAR-002;巾"],
        ["徽", "⿵&GWS-U5FAE-05-VAR-002;糸"],
        ["黴", "⿵&GWS-U5FAE-05-VAR-002;黑"],
        ["徴", "⿵&GWS-U5FAE-05-VAR-001;王"],
        ["衙", "⿴行吾"],
        ["𧗳", "⿴行言"],
        ["銜", "⿴行金"],
        ["衕", "⿴行同"],
        ["街", "⿴行圭"],
        ["衎", "⿴行干"],
        ["𧗸", "⿴行戔"],
        ["𧘂", "⿴行童"],
        ["衒", "⿴行玄"],
        ["𧗿", "⿴行率"],
        ["衢", "⿴行瞿"],
        ["衍", "⿴行氵"],
        ["衡", "⿴行𩵋"],
        ["䘙", "⿴行⿱韋帀"],
        ["䡓", "⿴行車"],
        ["鵆", "⿴行鳥"],
      ])

      .addIdsAfterTransforms("GWS-JUSTINSILVESTRE_U5009-TOP", "⿱亼&CDP-89CE;")
      .replaceIds("倉", "⿸&GWS-JUSTINSILVESTRE_U5009-TOP;口")

      .addIdsAfterTransforms("GWS-U5DF8-G", "⿰𦣞巳")
      .replaceIds("熙", "⿱&GWS-U5DF8-G;灬")

      .addIdsAfterTransforms(
        "GWS-U2FF1-CDP-88A1-U4E00",
        "&GWS-U2FF1-CDP-88A1-U4E00;",
      )
      .replaceIds("壺", "⿱士&GWS-U2FF1-CDP-88A1-U4E00;")

      .extractFigure("⿹⺄𠂇", "GWS-U5342-VAR-001")
      .addIdsAfterTransforms("GWS-U524D-UE0101", "⿱䒑&GWS-U5216-VAR-002;")
      .addIdsAfterTransforms("GWS-U5216-VAR-002", "⿰⺼刂")
      .replaceIds("煎", "⿱&GWS-U524D-UE0101;灬")
      .replaceIds("揃", "⿰扌&GWS-U524D-UE0101;")
      .replaceIds("箭", "⿱竹&GWS-U524D-UE0101;")

      .addAtomicIdsLine("GWS-JUSTINSILVESTRE_U268FB-03-TOP")
      .replaceIds("CDP-8DE0", "⿱&GWS-JUSTINSILVESTRE_U268FB-03-TOP;一")
      .replaceIds("CDP-8DE0", "⿱&GWS-JUSTINSILVESTRE_U268FB-03-TOP;一")
      .replaceIds("CDP-8CD4", "⿱&GWS-JUSTINSILVESTRE_U268FB-03-TOP;冖")

      // .addIdsAfterTransforms("GWS-JUSTINSILVESTRE_U5FE9-BOTTOM", "⿱厶心")
      // .replaceIds("窓", "⿱穴&GWS-JUSTINSILVESTRE_U5FE9-BOTTOM;")

      .addIdsAfterTransforms("GWS-U23A8A-VAR-001", "⿰⿱士冖殳") // variant of 𣪊
      .replaceIds("穀", "⿹&GWS-U23A8A-VAR-001;禾")
      .replaceIds("殼", "⿹𣪊几")
      .replaceIds("殻", "⿹&GWS-U23A8A-VAR-001;几")
      .replaceIds("穀", "⿹𣪊禾")

      .addIdsAfterTransforms("GWS-U20087-11", "⿻丿一") // reverse stroke order	𠂇
      .replaceIds("有", "⿸&GWS-U20087-11;月")
      .replaceIds("右", "⿸&GWS-U20087-11;口")
      .replaceIds("㡀", "⿻丷⿻巾八[GT]	⿱小⿵冂小[JK]	⿱⺌⿵冂小[X]")
      .addIdsAfterTransforms("GWS-U3840-G", "⿱⺌⿵冂小")
      .addIdsAfterTransforms("GWS-U655D-G", "⿰&GWS-U3840-G;攵")

      .replaceIds("幣", "⿱&GWS-U655D-G;巾")
      .replaceIds("弊", "⿱&GWS-U655D-G;廾")
      .addIdsAfterTransforms("GWS-AJ1-13890", "⿱入王")
      .replaceIds("詮", "⿰言&GWS-AJ1-13890;")
      .addIdsAfterTransforms("GWS-AJ1-13811", "⿰⿹弓&CDP-89A6;⿹弓&CDP-89A6;")
      .replaceIds("溺", "⿰氵&GWS-AJ1-13811;")
      .replaceIds("鰯", "⿰魚&GWS-AJ1-13811;")
      .addIdsAfterTransforms("GWS-U671D-UE0101", "⿰𠦝⺼")
      .replaceIds("嘲", "⿰口&GWS-U671D-UE0101;")

      .addIdsAfterTransforms("GWS-U672E-VAR-001", "⿺朩丶")
      .replaceIds("術", "⿴行&GWS-U672E-VAR-001;")
      .replaceIds("述", "⿺辶&GWS-U672E-VAR-001;")

      .addIdsAfterTransforms(
        "GWS-KOSEKI-321030",
        "⿱&GWS-U2FF0-U2E95-U2E95-03;隹",
      ) // variant of 翟 used in common chars
      .addIdsAfterTransforms("GWS-U2FF0-U2E95-U2E95-03", "⿰ヨヨ") // variant of 羽
      .replaceComponentOfFigures("曜躍濯耀燿", "翟", "&GWS-KOSEKI-321030;")

      .replaceComponentOfFigures(["当", "雪", "尋"], "彐", "ヨ")
      .replaceComponentOfFigures("急", "刍", "⿱𠂊ヨ")
      .replaceComponentOfFigures("疌", "彐", "⺕")
      .replaceComponentOfFigures("翅翏翰翳𦐇", "羽", "羽")

      .replaceManyIds([
        ["亲", "⿱立木"],
        ["冐", "⿱日月"],
        ["卵", "⿻卯丷"],
        ["戊", "⿰厂戈"],
        ["我", "⿰手戈"],
        ["赤", "⿻一亦"],
        ["亐", "⿻丂一"],
        ["失", "⿱矢丨"],
        ["CDP-8BC2", "⿹&CDP-8BBF;丨"], // 與 wrapper
        ["𦈢", "⿱午止"],
        ["令", "⿱亽龴"],
        ["𬗌", "⿰糸虫"],
        ["絲", "⿰糸糸"],
        ["CDP-8D50", "⿸&CDP-8CC9;罒"],
        ["雚", "⿱艹𨾴"],
        ["薨", "⿳𦭝冖死"],
        ["CDP-8BCB", "⿻口儿"],
        ["兔", "⿷免丶[GTJV]	⿷免丶[K]"],
        ["CDP-8C7A", "⿱口⿰丨二"],
        ["CDP-8D6B", "⿱丱一"],
        ["CDP-8CE4", "⿻⿱丿⿰丨二丶"],
        ["萠", "⿱艹朋[G]	⿱艹⿰⺼⺼[J]"],
        ["憂", "⿱㥑夂[GK]	⿱㥑夊[TV]	⿱&CDP-8CD4;𢖻[J]"],
        ["寡", "⿳宀&CDP-8DE0;分"],
        ["党", "⿱𫩠儿"],
        ["由", "⿻田丨"],
        ["来", "⿻一米"],
        ["周", "⿵⺆⿱土口[GTJV]	⿵⺆⿱&CDP-8BF1;口[K]"],
        ["舎", "⿳𠆢土口"],
        ["袁", "⿳土口𧘇"],
        ["CDP-89ED", "⿻二巾"],
        ["衰", "⿻哀一"],

        ["卉", "⿱十艹"],

        // 𭃌 should be a sound component
        ["絜", "⿱㓞糸[GTKV]	⿱𭃌糸[J]"],
      ])
      // strange case: Japanese only has 卂 in standalone character.
      // so this might be more properly treated as a variant,
      // but since 巩 is so rare on its own, we're just
      // ignoring its standalone form analysis.
      .addIdsAfterTransforms("GWS-U5DE9-G", "⿰工凡[GJ]	⿰工卂[T]")
      .replaceEverywhere("巩", "&GWS-U5DE9-G;")
      .replaceManyIds([
        ["迶", "⿺⻌有"],
        ["酋", "⿱八酉"],
        ["鎖", "⿰金⿱⺌貝"],
        ["𠬶", "⿳⺕冖又"],
        ["葛", "⿱艹曷[GTK]"],
        ["僅", "⿰亻堇"],
        ["皮", "⿸⿻&CDP-88E2;丨又"],
        ["絕", "⿰糹&CDP-8CEA;	⿰糸&CDP-8CEA;[J]"],
        ["繭", "⿱艹&CDP-8DDC;[GTK]	⿱艹&CDP-8DDC;[J]"],
        ["䏍", "⿱厶⺼[T]	⿱厶月[KJ]"],
        ["覃", "⿱覀早[GTKJ]	⿱襾早"],
        ["𣥂", "⿱⿰丶亅丿"],
        ["候", "⿴侯丨"],
        ["麗", "⿱⿰⿱一⿵冂丶⿱一⿵冂丶鹿"],
        ["CDP-8BB5", "⿰&CDP-88F0;犬	⿰&CDP-8B5E;犬[J]"],
        ["CDP-8BC3", "⿱&CDP-88F0;寸	⿱&CDP-8B5E;寸[J]"],
        ["CDP-8C4F", "⿰&CDP-88F0;&CDP-8C4E;	⿰&CDP-8B5E;&CDP-8C4E;[J]"],
        ["強", "⿸弘虫"],
        ["祢", "⿰礻尔[GT]	⿰示尔[K]	⿰礻尓[J]"],
        ["摇", "⿰扌&GWS-U4343-VAR-001;"],
        ["瑶", "⿰王&GWS-U4343-VAR-001;"],
        ["杀", "⿱㐅朩[G]	⿱㐅木[J]"],
        ["杂", "⿱九朩[G]	⿱九木[J]"],
        ["咎", "⿱⿺夂人口"],
        ["捲", "⿰扌卷"],
        ["倦", "⿰亻卷"],
        ["鯖", "⿰魚青[GT]	⿰魚靑[KJ]"],
        ["錆", "⿰金青[GTV]	⿰金靑[KJ]"],
        ["愈", "⿱兪心[K]"],
        ["修", "⿸攸彡"],
        ["倏", "⿸攸犬"],
        ["儵", "⿸攸黑"],
        ["條", "⿸攸木"],
        ["絛", "⿸攸糸"],
        ["脩", "⿸攸月"],
        ["鯈", "⿸攸魚"],
        ["班", "⿲𤣩&CDP-8968;王"],
        ["𪺍", "⿱爫ヨ"],
        ["𤔌", "⿳爫工彐[G]	⿳爫工⺕[TJ]"],
        ["𠬶", "⿳⺕冖又"], // 寢 bottom right
        ["寝", "⿱宀⿰丬&GWS-U20B36-VAR-002;"],
        ["CDP-8DBA", "⿻⿱禾丂戈"],
        ["CDP-8C42", "⿱丶&CDP-8B7C;	⿱丨&CDP-8B7C;[J]"], // common left variant of 良
        ["並", "⿱丷亚"],
        ["CDP-8DE3", "⿱一&CDP-8A65;"], // kane bottom
        ["CDP-8BBD", "⿱业𦍌"],
        ["里", "⿱田土"],
        ["CDP-88D4", "⿱&CDP-8B62;土"],
        ["曽", "⿱丷𭥫"],
        ["諺", "⿰言彦[G]	⿰言彥[TKVJ]"],
        ["年", "⿱𠂉㐄"],
        ["曰", "⿴口一"],
        ["白", "⿱丿日"],
        ["事", "⿻⿳一口⺕亅"],
        ["承", "⿱乛⿻水三"],
        ["永", "⿱丶⿻乛水"],
        ["缶", "⿻午山"],
        ["疋", "⿱乛龰"],
        ["疌", "⿻⿱一⺕龰"],
        ["東", "⿻木日"],
        ["柬", "⿻束丷"],
        ["未", "⿻一木"],
        ["末", "⿻一木"],
        ["本", "⿻木一"],
        ["朱", "⿻𠂉木"],
        ["束", "⿻木口"],
        ["朿", "⿻木冂"],
        ["豆", "⿳一口䒑"],
        ["曳", "⿻⿻日乚丿"],
        ["尢", "⿻一儿"],
        ["重", "⿱千里"],
        ["CDP-8C4B", "⿻廿儿"],
        ["飛", "⿹⿰⺄⺀⿻丨⿻⿱㇀丿⿰⺄⺀"],
        ["酉", "⿻西一"],
        ["熏", "⿱千黑"],
        ["已", "⿻己丨"],
        ["CDP-89B0", "⿻⿱⺊己三"],
        ["CDP-89B0", "⿻⿱&CDP-8BBF;己三"], // 龍 right
        ["㐆", "⿳丿&CDP-89CE;&CDP-8B6C;"],
        ["臣", "⿻巨⿱丨丨"],
        ["粛", "⿻⿻肀米&CDP-8BF5;"],
        ["肅", "⿻肀𣶒"],
        ["禹", "⿱丿⿻虫冂"],
        ["CDP-89B9", "⿻口儿"],
        ["冘", "⿻冖儿"],
        ["戉", "⿻𠄌戊"],
        ["CDP-87C5", "⿻甲龷"],
        ["申", "⿱丨甲"],
        ["谷", "⿳八𠆢口"],
        ["寸", "⿹𬺰丶"],
        ["才", "⿻𬺰丿"],
        ["巴", "⿻巳丨"],
        ["史", "⿻口乂"],
        ["丈", "⿱十乂"],
        ["久", "⿱𠂊人"],
        ["隶", "⿱肀氺"],
        ["甘", "⿻廿一"],
        ["廿", "⿻⿰十十一"],
        ["革", "⿱廿⿻口十"],
        ["CDP-89C5", "⿻⿻口十口"],
        ["ユ", "⿱𠃍一"],
        ["以", "⿲⿱丨㇀丶人"],

        ["垔", "⿱覀土"],
        ["兪", "⿱亼⿰月巜[GT]	⿱𠓛⿰⺼巜[JK]"],
        ["CDP-8CEC", "⿱龷月"],
        ["用", "⿵⺆&CDP-8BF1;"],
        ["臿", "⿻千臼"],
        ["夜", "⿱亠⿰亻⿻夕乀"],
        ["𬎾", "⿻肀用"],
        ["㒸", "⿱䒑𧰨"],
        ["CDP-8BF8", "⿱&CDP-876E;十"],
        ["乗", "⿻禾龷"],
        ["垂", "⿳丿&CDP-876E;一"], // should use well jing3?
        ["乗", "⿻禾&CDP-876E;"],
        ["垂", "⿻壬&CDP-876E;"],
        ["頁", "⿱𦣻八"],
        ["𤴔", "⿱乛止"],
        ["犬", "⿻大丶"],
        ["舟", "⿱丶⿻丹丨"],
        ["𠂇", "⿻一丿"],

        ["卑", "⿱&CDP-89BE;十[GTK]	⿱甶⿶十丿[J]"],
        ["𤰞", "⿱田⿶十丿"], // not in kanjijump; might be used for traditional zh
        ["卑", "⿱&CDP-89BE;十"],
        ["牌", "⿰片卑"],
        ["痺", "⿸疒卑"],
        ["稗", "⿰禾卑"],
        ["脾", "⿰月卑"],
        ["黙", "⿺黒犬"],
        ["勲", "⿺𤋱力"],
        ["菫", "⿻𦰌一"],
        ["營", "⿱𤇾呂"],
        ["串", "⿻中口"],
        ["捌", "⿰扌別"],
        ["槪", "⿰木既"],
        ["翟", "⿱羽隹"],
        ["車", "⿻&CDP-8BF1;日"],
        ["睿", "⿱𣦵⿴谷二"], // maybe should incorporate eye
        ["㕡", "⿹𣦻谷"],
        ["叡", "⿹𣦻⿴谷二"], // maybe should incorporate eye
        ["㕢", "⿹𣦻貝"],
        ["䧹", "⿱丿雁"],

        ["言", "⿱⿳丶一二口"],

        ["叟", "⿱&CDP-884F;又[GK]	⿱𦥔又[JT]"],
        ["幸", "⿻一辛"],

        ["危", "⿱𠂊厄"],
      ])
      .extractFigureFromIdsSegment({
        componentIdsSegment: "⿰王",
        replacementIdsSegment: "⿰𤣩",
        extractedFigureId: "𤣩",
      })
      .replaceIds("𩰊", "⿰王亅")
      .replaceIds("𩰋", "⿰王丨")
      .extractFigureFromIdsSegment({
        componentIdsSegment: "⿱人",
        replacementIdsSegment: "⿱𠆢",
        extractedFigureId: "𠆢",
      })
      .extractFigureFromIdsSegment({
        componentIdsSegment: "⿱竹",
        replacementIdsSegment: "⿱⺮",
        extractedFigureId: "⺮",
        newCompleteIds: "⺮",
      })

      .extractFigureFromIdsSegment({
        componentIdsSegment: "⿰阝",
        replacementIdsSegment: "⿰⻖",
        extractedFigureId: "⻖",
        newCompleteIds: "⻖",
      })
      .extractFigureFromIdsSegment({
        componentIdsSegment: /(\S)阝/gu,
        replacementIdsSegment: "$1⻏",
        extractedFigureId: "⻏",
        newCompleteIds: "⻏",
      })
      .addAtomicIdsLine("⻌")
      .replaceIds("辶", "⿱⻌丶")

      .replaceEverywhere("⿱爫夫", encodeFigure("GWS-U595A-ITAIJI-001"))
      .addIdsAfterTransforms("GWS-U595A-ITAIJI-001", "⿱⺤夫") // simplified component form of 奚    ⿱爫夫
      .replaceEverywhere("⿱十𭾱", encodeFigure("GWS-U8931-ITAIJI-004"))
      .addIdsAfterTransforms("GWS-U8931-ITAIJI-004", "⿱十𭾱") // simplified component form of 褱
      .extractFigure("⿱日匂", "GWS-U66F7-VAR-005")
      .replaceEverywhere("⿱爫𠙻", encodeFigure("GWS-U4343-VAR-001"))
      .addIdsAfterTransforms("GWS-U4343-VAR-001", "⿱⺤𠙻") // simplified component form of  䍃
      .extractFigure("⿱𠂊旧", "GWS-U2FF1-U2008A-U65E7")
      .addAtomicIdsLine("⺤")
      .replaceIds("CDP-8BB8", "⿱⺤冖")
      .replaceIds("𢚩", "⿱⿱⺤ヨ心")

      .extractFigure("⿱彐𧰨", "GWS-U5F56-ITAIJI-001")

      .replaceEverywhere(/⿳十罒心/g, "⿱&GWS-FITZGERALD_JUR133;心")
      .addIdsAfterTransforms("GWS-FITZGERALD_JUR133", "⿱十罒")
      .extractFigure("⿱&GWS-FITZGERALD_JUR133;心", "GWS-U226F3-VAR-001")
      .extractFigure("⿱𭕄凶", "GWS-U2FF1-U2D544-U51F6") // simplified component form of  𡿺
      .replaceEverywhere(/⿱&CDP-8CA3;𧘇/gu, "&GWS-U2FF3-U5405-U2000E-U27607;")
      .replaceEverywhere(
        /⿳(.)&CDP-8CA3;𧘇/gu,
        "⿱$1&GWS-U2FF3-U5405-U2000E-U27607;",
      )
      .extractFigure("⿳八𠀎𧘇", "GWS-JUSTINSILVESTRE_U342E-BOTTOM")
      .replaceEverywhere(/⿳六𠀎𧘇/gu, "⿱亠&GWS-JUSTINSILVESTRE_U342E-BOTTOM;")

      .addIdsAfterTransforms("GWS-U20B36-VAR-002", "⿳ヨ冖又")
      .replaceComponentOfFigures("浸侵寝", "𠬶", "&GWS-U20B36-VAR-002;")

      .addIdsAfterTransforms("GWS-U81E5-ITAIJI-001", "⿰臣𠂉")
      .replaceIds("CDP-8CC9", "⿱&GWS-U81E5-ITAIJI-001;一")
      .replaceIds("臨", "⿸&GWS-U81E5-ITAIJI-001;品")
      .replaceIds("鹽", "⿱⿸&GWS-U81E5-ITAIJI-001;鹵皿")

      .extractFigure("⿹𢦏业", "GWS-U97F1-VAR-001")
      .extractFigure("⿺𠃊米", "GWS-U2FFA-U200CA-U7C73")

      .replaceEverywhere(encodeFigure("CDP-8BAB"), "⺕")

      .extractFigure("⿱龴田", "GWS-U752C-03-VAR-001")

      .addIdsAfterTransforms("GWS-CDP-8CA9-07", "⿱左月	⿱左⺼")
      .replaceEverywhere(encodeFigure("CDP-8CA9"), "&GWS-CDP-8CA9-07;")

      .extractFigureFromIdsSegment({
        componentIdsSegment: "⿳𭕄冖",
        replacementIdsSegment: "⿱&GWS-U300EE;",
        extractedFigureId: "GWS-U300EE",
        newCompleteIds: "⿱𭕄冖",
      })

      .addIdsAfterTransforms("GWS-U752B-03-VAR-001", "⿻𤰔丶") // variant of 甫
      .addIdsAfterTransforms("GWS-U5C03-VAR-001", "⿱&GWS-U752B-03-VAR-001;寸") //   // variant of 尃
      .addIdsAfterTransforms("GWS-U65C9-UE0102", "⿱&GWS-U752B-03-VAR-001;方") // variant of 旉
      .replaceEverywhere(/⿱⿺𤰔丶方/gu, "&GWS-U65C9-UE0102;")
      .replaceEverywhere(/⿱⿺𤰔丶寸/gu, "&GWS-U5C03-VAR-001;")
      .addIdsAfterTransforms("GWS-U6EA5-VAR-003", "⿰氵&GWS-U5C03-VAR-001;") // variant of 溥
      .replaceEverywhere(/⿰氵&GWS-U5C03-VAR-001;/gu, "&GWS-U6EA5-VAR-003;")

      .addIdsAfterTransforms("GWS-U514D-G", "⿱𠂊&CDP-8BCB;")
      .replaceComponentOfNonSimplifiedCharacters("免", "&GWS-U514D-G;")

      .replaceComponentOfSimplifiedCharacters("辶", "⻌")
      .replaceIds("辶", "⿱⻌丶")

      .replaceComponentOfNonSimplifiedCharacters("者", "者")
      .replaceIds("者", "⿻者丶")
      .replaceIds("著", "⿱艹者")
      .replaceComponentOfFigures(simplifiedJoyo, "𩙿", "飠")
      .replaceComponentOfNonSimplifiedCharacters("飠", "𩙿")
      .replaceComponentOfNonSimplifiedCharacters("謁", "謁")
      .replaceComponentOfSimplifiedCharacters("爫", "⺤")

      .addIdsAfterTransforms("GWS-U5B5A-G", "⿱⺤子")
      .replaceComponentOfSimplifiedCharacters("孚", "&GWS-U5B5A-G;")

      .addIdsAfterTransforms("GWS-U7230-G", "⿳⺤一友")
      .replaceIds("媛", "⿰女&GWS-U7230-G;")
      .replaceComponentOfSimplifiedCharacters("爰", "&GWS-U7230-G;")
      .addIdsAfterTransforms("GWS-U5BFD-G", "⿱⺤寸")
      .replaceComponentOfSimplifiedCharacters("寽", "&GWS-U5BFD-G;")
      .addIdsAfterTransforms("GWS-U914B-G", "⿱丷酉")
      .replaceComponentOfSimplifiedCharacters("酋", "&GWS-U914B-G;")

      .addIdsAfterTransforms("GWS-U4E35-G", "⿱业𢆉")
      .replaceEverywhere("丵", "&GWS-U4E35-G;")

      .addAtomicIdsLine("GWS-U4E29-VAR-001")
      .replaceComponentOfFigures("赳糾叫", "丩", "&GWS-U4E29-VAR-001;")

      .addAtomicIdsLine("⺕")
      .addAtomicIdsLine("ヨ")

      .addIdsAfterTransforms("GWS-U2FF1-U5DDB-U9FB1", "⿱巛龱")
      .replaceIds("巤", "⿱&GWS-U2FF1-U5DDB-U9FB1;&CDP-8D46;")

      .replaceIds("刅", "⿻刀八")
      .replaceIds("籾", "⿰米刄")

      .replaceIds("米", "⿻丷木")

      .replaceIds("宀", "⿱丨冖")
      .replaceIds("自", "⿱丿目")

      .replaceIds("參", "⿱厽㐱")
      .replaceIds("主", "⿱丶王")

      .extractFigureFromIdsSegment({
        componentIdsSegment: /⿲(.)育攵/g,
        replacementIdsSegment: "⿰$1&GWS-U3054E-JV;",
        extractedFigureId: "GWS-U3054E-JV",
        newCompleteIds: "⿰育攵",
      })

      .replaceIds("哀", "⿴衣口")
      .replaceIds("耆", "⿱耂旨")

      .replaceIds("夢", "⿳𦭝冖夕[GK]	⿱&CDP-8D60;夕[JT]")
      .replaceIds("薨", "⿱&CDP-8D60;死")
      .replaceIds("CDP-8D60", "⿳艹罒冖	⿱𦭝冖[J]")

      .replaceIds("耂", "⿻土丿")
      .extractFigureFromIdsSegment({
        componentIdsSegment: /⿳(\S+)一&CDP-8CC6;/g,
        replacementIdsSegment: "⿱$1&GWS-U2FF1-U4E00-CDP-8CC6-VAR-001;",
        extractedFigureId: "GWS-U2FF1-U4E00-CDP-8CC6-VAR-001",
        newCompleteIds: "⿱一&CDP-8CC6;",
      })
      .replaceIds("辰", "⿸厂⿱一&GWS-U2FF1-U4E00-CDP-8CC6-VAR-001;")
      .replaceIds("CDP-8CE5", "⿱卄&GWS-U2FF1-U4E00-CDP-8CC6-VAR-001;")
      .replaceIds("畏", "⿳田一&GWS-U2FF1-U4E00-CDP-8CC6-VAR-001;")
      .replaceIds("喪", "⿱⿻十吅&GWS-U2FF1-U4E00-CDP-8CC6-VAR-001;")
      .replaceIds("CDP-884A", "⿰丨三")
      .replaceIds("𧘇", "⿸丿&CDP-8CC6;")

      .extractFigureFromIdsSegment({
        componentIdsSegment: /(&CDP-8C41;(?=\S)|(?<=\S)&CDP-8C41;)/g,
        replacementIdsSegment: "&GWS-CDP-8C41-VAR-003;",
        extractedFigureId: "GWS-CDP-8C41-VAR-003",
        newCompleteIds: "⿲二丨二",
      })

      .replaceIds("艮", "⿺&CDP-8CC6;ヨ")

      .replaceIds("𠂢", "⿸𠂆&GWS-U27607-VAR-010;")
      .addAtomicIdsLine("GWS-U27607-VAR-010")

      .extractFigureFromIdsSegment({
        componentIdsSegment: "⿰&CDP-8968;帚[J]",
        replacementIdsSegment: "⿰&CDP-8968;&GWS-U5E1A-G;[J]",
        extractedFigureId: "GWS-U5E1A-G",
        newCompleteIds: "⿳ヨ冖巾",
      })
      .replaceIds("掃", "⿰扌&GWS-U5E1A-G;")
      .replaceIds("婦", "⿰女&GWS-U5E1A-G;")
      .replaceIds("隡", "⿰阝産[G]	⿰阝產[TJ]")
      .replaceIds("弐", "⿻一弍")
      // bottom of 纂
      .replaceIds("𮅕", "⿳⺮目大")
      .replaceIds("蘭", "⿰⿱艹闌	⿰⿱艹䦨[J]")
      .replaceIds("煉", "⿰火柬")

      .replaceIds("鬱", "⿳⿴林缶冖⿰鬯彡")

      .forceAtomic(kanjijumpForcedAtomicFigures)
  );
};
