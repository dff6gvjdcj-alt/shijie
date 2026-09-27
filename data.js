/**
 * 俯仰之间 —— 合肥一六八中学线上美育数字展厅
 * 数据模型：分区 → 媒介 → 画展 → 主题 → 作品
 * 共 4 分区 / 7 媒介 / 9 画展 / 22 主题 / 120 件作品
 */
const EXHIBITION_DATA = {
  site: {
    title: '俯仰之间',
    subtitle: '合肥一六八中学线上美育数字展厅',
    year: '2026'
  },
  zones: [
    /* ============ 1. 星浕 —— 金火成彩（掐丝珐琅） ============ */
    {
      id: 'xingjin',
      name: '星浕',
      subtitle: '金火成彩',
      mediumLabel: '掐丝珐琅',
      accent: '#C9A96E',
      glow: 'rgba(201,169,110,0.35)',
      bgGradient: 'radial-gradient(ellipse at 30% 20%, #241a10 0%, #0e0a06 70%)',
      description: '铜丝为骨，珐琅为肌，经八百摄氏度窑火淬炼，色彩凝于方寸之间。星浕之中，金火相与，流光不灭。',
      media: [
        {
          id: 'enamel',
          name: '掐丝珐琅',
          description: '以铜丝勾勒轮廓，以珐琅釉料填色，经烧制、打磨、镀金而成。',
          exhibitions: [
            {
              id: 'enamel-technique',
              name: '丝韵流光',
              coverHue: 38,
              description: '从传统纹样到山水意境，呈现掐丝珐琅技法的多元面貌。',
              themes: [
                {
                  id: 'enamel-flower',
                  name: '花卉翎毛',
                  description: '以珐琅之色写花鸟之姿，丝缕之间见生机。',
                  works: [
                    { id: 'XJ-E01', title: '牡丹绶带', author: '林婉清', year: '2025', desc: '牡丹盛放，绶带双栖，以深蓝釉为地，金线勾勒花瓣脉络。' },
                    { id: 'XJ-E02', title: '荷风鹭影', author: '沈墨白', year: '2025', desc: '夏日荷塘，白鹭独立，釉色由浅入深表现水面光影。' },
                    { id: 'XJ-E03', title: '梅雀图', author: '苏云锦', year: '2024', desc: '寒梅一枝，雀鸟栖枝，红釉与白釉对比鲜明。' },
                    { id: 'XJ-E04', title: '竹石双禽', author: '顾长歌', year: '2025', desc: '翠竹倚石，双禽和鸣，绿釉层次丰富，石面以灰釉表现质感。' },
                    { id: 'XJ-E05', title: '菊韵秋声', author: '叶知秋', year: '2024', desc: '秋菊傲霜，虫鸣唧唧，黄釉与紫釉交织出秋意。' },
                    { id: 'XJ-E06', title: '兰香蝶舞', author: '陆青禾', year: '2025', desc: '幽兰生于空谷，彩蝶翩跹，以淡蓝釉渲染空谷氛围。' }
                  ]
                },
                {
                  id: 'enamel-landscape',
                  name: '山水意境',
                  description: '将山水移入方寸铜胎，以釉代墨，见天地辽阔。',
                  works: [
                    { id: 'XJ-E07', title: '云山叠翠', author: '沈墨白', year: '2025', desc: '层峦叠嶂，云雾缭绕，青釉与绿釉渐变表现山色空蒙。' },
                    { id: 'XJ-E08', title: '烟波钓叟', author: '林婉清', year: '2024', desc: '江面烟波浩渺，一叟独钓，蓝釉铺底，金线勾波纹。' },
                    { id: 'XJ-E09', title: '秋山行旅', author: '顾长歌', year: '2025', desc: '秋山红叶，行旅匆匆，赭石与朱砂釉表现秋色。' },
                    { id: 'XJ-E10', title: '寒江独钓', author: '苏云锦', year: '2024', desc: '千山鸟飞绝，万径人踪灭，以冷灰蓝釉营造孤寂之境。' },
                    { id: 'XJ-E11', title: '春山暖日', author: '叶知秋', year: '2025', desc: '春日山峦，暖阳普照，嫩绿与鹅黄釉交织。' },
                    { id: 'XJ-E12', title: '松风泉韵', author: '陆青禾', year: '2025', desc: '古松苍劲，飞泉流泻，深绿釉写松，白釉表现水花。' }
                  ]
                }
              ]
            },
            {
              id: 'enamel-creation',
              name: '金火之歌',
              coverHue: 32,
              description: '学生创作专题，在传统器形与纹样中注入当代思考。',
              themes: [
                {
                  id: 'enamel-objects',
                  name: '器物创新',
                  description: '突破传统器形，以珐琅语言表达对当代生活的观察。',
                  works: [
                    { id: 'XJ-E13', title: '星轨瓶', author: '陆青禾', year: '2025', desc: '瓶身以深蓝釉为底，金线勾勒星轨，象征时间流转。' },
                    { id: 'XJ-E14', title: '潮汐盏', author: '林婉清', year: '2025', desc: '盏内釉色如潮汐涨落，蓝白渐变，手可感知温度。' },
                    { id: 'XJ-E15', title: '熔金盘', author: '沈墨白', year: '2024', desc: '盘面金釉流淌如熔岩，经多次烧制形成自然纹理。' },
                    { id: 'XJ-E16', title: '织梦盒', author: '苏云锦', year: '2025', desc: '盒面以细密铜丝编织如梦似幻的纹样，开合之间见匠心。' },
                    { id: 'XJ-E17', title: '流光尊', author: '顾长歌', year: '2025', desc: '尊身釉色随光线变化而流动，如流光溢彩。' },
                    { id: 'XJ-E18', title: '焰火鼎', author: '叶知秋', year: '2024', desc: '鼎身以红橙釉表现焰火升腾，三足稳重，气势恢宏。' }
                  ]
                },
                {
                  id: 'enamel-patterns',
                  name: '传统纹样',
                  description: '回溯经典纹样，在传承中理解珐琅之美。',
                  works: [
                    { id: 'XJ-E19', title: '缠枝莲纹', author: '苏云锦', year: '2024', desc: '缠枝莲连绵不绝，寓意生生不息，红蓝釉交替填色。' },
                    { id: 'XJ-E20', title: '云鹤延年', author: '顾长歌', year: '2025', desc: '仙鹤翱翔于祥云之间，白釉与青釉搭配清雅。' },
                    { id: 'XJ-E21', title: '宝相花', author: '林婉清', year: '2025', desc: '宝相花层叠绽放，融合莲花与牡丹之形，色彩富丽。' },
                    { id: 'XJ-E22', title: '海水江崖', author: '沈墨白', year: '2024', desc: '海水翻涌，山崖耸立，寓意江山永固，蓝釉为主。' },
                    { id: 'XJ-E23', title: '夔龙纹', author: '叶知秋', year: '2025', desc: '夔龙蜿蜒，古拙有力，以铜丝勾勒龙鳞细节。' },
                    { id: 'XJ-E24', title: '如意云头', author: '陆青禾', year: '2025', desc: '如意云头排列有序，寓意吉祥如意，色彩柔和。' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },

    /* ============ 2. 疏纹 —— 木刻留章（版画、摄影） ============ */
    {
      id: 'shuwen',
      name: '疏纹',
      subtitle: '木刻留章',
      mediumLabel: '版画 · 摄影',
      accent: '#8FA8B8',
      glow: 'rgba(143,168,184,0.35)',
      bgGradient: 'radial-gradient(ellipse at 70% 30%, #141c22 0%, #080c10 70%)',
      description: '刀走龙蛇，木留痕迹；光影定格，瞬间永恒。疏纹之中，以刀代笔，以镜为眼，记录人间烟火。',
      media: [
        {
          id: 'printmaking',
          name: '版画',
          description: '以刀刻木，以墨印纸，每一张都是独一无二的痕迹。',
          exhibitions: [
            {
              id: 'printmaking-works',
              name: '刀痕木语',
              coverHue: 210,
              description: '黑白木刻与套色版画并置，呈现版画语言的张力。',
              themes: [
                {
                  id: 'print-bw',
                  name: '黑白木刻',
                  description: '纯粹的黑白之间，刀痕即是语言。',
                  works: [
                    { id: 'SW-P01', title: '老城巷陌', author: '周慕白', year: '2025', desc: '老城巷弄，光影斑驳，以粗犷刀痕表现岁月质感。' },
                    { id: 'SW-P02', title: '耕者', author: '吴听雨', year: '2024', desc: '老农俯身耕作，线条有力，黑白对比强烈。' },
                    { id: 'SW-P03', title: '窗影', author: '郑南枝', year: '2025', desc: '窗棂投影于墙面，疏密有致，静谧安宁。' },
                    { id: 'SW-P04', title: '归途', author: '王砚秋', year: '2025', desc: '暮色中行人归途，剪影效果，意境深远。' },
                    { id: 'SW-P05', title: '晨市', author: '冯子墨', year: '2024', desc: '清晨集市人声鼎沸，以密集线条表现热闹氛围。' },
                    { id: 'SW-P06', title: '老树', author: '陈星河', year: '2025', desc: '百年老树苍劲挺拔，树干纹理以深刻刀痕表现。' }
                  ]
                },
                {
                  id: 'print-color',
                  name: '套色版画',
                  description: '多版套印，色彩层叠，赋予木刻以温度。',
                  works: [
                    { id: 'SW-P07', title: '春日市集', author: '吴听雨', year: '2025', desc: '春日市集繁花似锦，桃红柳绿，套色层次丰富。' },
                    { id: 'SW-P08', title: '花房', author: '周慕白', year: '2024', desc: '温室花房春意盎然，阳光透过玻璃洒下色块。' },
                    { id: 'SW-P09', title: '夏夜', author: '郑南枝', year: '2025', desc: '夏夜星空，萤火点点，深蓝与暖黄对比。' },
                    { id: 'SW-P10', title: '丰收', author: '王砚秋', year: '2025', desc: '金秋丰收，麦浪翻滚，以金黄与赭石为主调。' },
                    { id: 'SW-P11', title: '庙会', author: '冯子墨', year: '2024', desc: '庙会人潮涌动，红灯高挂，色彩热烈。' },
                    { id: 'SW-P12', title: '雪后', author: '陈星河', year: '2025', desc: '雪后初霁，银装素裹，以淡蓝与留白表现清寒。' }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'photography',
          name: '摄影',
          description: '以镜头捕捉光影，定格转瞬即逝的瞬间。',
          exhibitions: [
            {
              id: 'photo-works',
              name: '视界摄影展',
              coverHue: 200,
              description: '看见·向上的力量，遇见·光阴的诗行，听见·山河的回声，触摸·人间的烟火——四个维度，用镜头观察世界。',
              themes: [
                {
                  id: 'photo-see',
                  name: '看见·向上的力量',
                  description: '看见平凡，看见感动，看见价值观在光影中生长。校园里伸手相助的温暖、运动场上拼尽全力的奔跑、非遗课堂上专注的侧脸；走出校门，妈妈接我回家的目光、建筑工人挥汗如雨的身影、路口交警风雨无阻的坚守——这些平凡瞬间闪烁着真实的光亮。',
                  works: [
                    { id: 'SW-PH001', title: '对话', author: '高仕诚', year: '2026', desc: '', image: '3.jpg' },
                    { id: 'SW-PH002', title: '驰骋', author: '黄钰', year: '2026', desc: '', image: '4.jpg' },
                    { id: 'SW-PH003', title: '与你同行', author: '汪敏姝', year: '2026', desc: '', image: '7.jpg' },
                    { id: 'SW-PH004', title: '传承的力量', author: '金永汉', year: '2026', desc: '', image: '8.jpg' },
                    { id: 'SW-PH005', title: '青春', author: '陈美锡', year: '2026', desc: '', image: '9.jpg' },
                    { id: 'SW-PH006', title: '篮球梦', author: '刘亚洲', year: '2026', desc: '', image: '10.jpg' },
                    { id: 'SW-PH007', title: '起飞', author: '祖天佑', year: '2026', desc: '', image: '56.jpg' },
                    { id: 'SW-PH008', title: '晨光', author: '汪杰瑞', year: '2026', desc: '', image: '12.jpg' },
                    { id: 'SW-PH009', title: '心灵休憩站', author: '佘逸珺', year: '2026', desc: '', image: '33.jpg' },
                    { id: 'SW-PH010', title: '专注', author: '陈羽晨', year: '2026', desc: '', image: '11.jpg' },
                    { id: 'SW-PH011', title: '冲刺', author: '梅宇轩', year: '2026', desc: '', image: '48.jpg' }
                  ]
                },
                {
                  id: 'photo-meet',
                  name: '遇见·光阴的诗行',
                  description: '在日常中遇见诗意，让光影成为另一种语言。枝头初绽的花苞、秋天飘落的树叶、雨后初晴的水洼、季节更迭中悄然变化的色彩——诗意并不遥远，它就藏在这些日常画面里。我们尝试用镜头与古诗对话，按下快门的那一刻，觉得自己读懂了他们。',
                  works: [
                    { id: 'SW-PH012', title: '春日影', author: '杨斯语', year: '2026', desc: '', image: '19.jpg' },
                    { id: 'SW-PH013', title: '跃上枝头', author: '梅宇轩', year: '2026', desc: '', image: '27.jpg' },
                    { id: 'SW-PH014', title: '洁', author: '李若溪', year: '2026', desc: '', image: '65.jpg' },
                    { id: 'SW-PH015', title: '清莲', author: '李若溪', year: '2026', desc: '', image: '67.jpg' },
                    { id: 'SW-PH016', title: '一荷盛夏', author: '李若溪', year: '2026', desc: '', image: '69.jpg' },
                    { id: 'SW-PH017', title: '翠拥荷韵', author: '周珠怡', year: '2026', desc: '', image: '38.jpg' },
                    { id: 'SW-PH018', title: '逆光', author: '毛可欣', year: '2026', desc: '', image: '66.jpg' },
                    { id: 'SW-PH019', title: '玉盘珍珠', author: '张跃轩', year: '2026', desc: '', image: '55.jpg' },
                    { id: 'SW-PH020', title: '花之舞', author: '高仕诚', year: '2026', desc: '', image: '13.jpg' },
                    { id: 'SW-PH021', title: '电流原野', author: '史谦予', year: '2026', desc: '', image: '40.jpg' },
                    { id: 'SW-PH022', title: '生长的力量', author: '徐子祺', year: '2026', desc: '', image: '43.jpg' },
                    { id: 'SW-PH023', title: '翠叶斑蝶', author: '张一驰', year: '2026', desc: '', image: '16.jpg' },
                    { id: 'SW-PH024', title: '依偎', author: '史谦予', year: '2026', desc: '', image: '15.jpg' },
                    { id: 'SW-PH025', title: '枝', author: '王奕涵', year: '2026', desc: '', image: '21.jpg' },
                    { id: 'SW-PH026', title: '花语', author: '席心怡', year: '2026', desc: '', image: '24.jpg' },
                    { id: 'SW-PH027', title: '春意', author: '席欣怡', year: '2026', desc: '', image: '49.jpg' }
                  ]
                },
                {
                  id: 'photo-hear',
                  name: '听见·山河的回声',
                  description: '走出校园，世界变得更加辽阔。从一棵树的四季轮转，看到时间的形状；从自然的山脉与河流，读懂天地的尺度。清晨草叶上的露珠、黄昏漫天的晚霞，都被装进取景框里。这个过程让我们学会等待与敬畏——这些作品，既是记录，也是与天地对话的方式。',
                  works: [
                    { id: 'SW-PH028', title: '森林之夜', author: '梅宇轩', year: '2026', desc: '', image: '1.jpg' },
                    { id: 'SW-PH029', title: '银河', author: '阚彦彬', year: '2026', desc: '', image: '62.jpg' },
                    { id: 'SW-PH030', title: '暮色织梦，银翼为针', author: '史谦予', year: '2026', desc: '', image: '42.jpg' },
                    { id: 'SW-PH031', title: '树影婆娑', author: '巫怡青', year: '2026', desc: '', image: '60.jpg' },
                    { id: 'SW-PH032', title: '童年碧影', author: '杨斯语', year: '2026', desc: '', image: '51.jpg' },
                    { id: 'SW-PH033', title: '麦穗', author: '巫怡青', year: '2026', desc: '', image: '18.jpg' },
                    { id: 'SW-PH034', title: '望', author: '李若溪', year: '2026', desc: '', image: '39.jpg' },
                    { id: 'SW-PH035', title: '落日', author: '巫怡青', year: '2026', desc: '', image: '47.jpg' },
                    { id: 'SW-PH036', title: '落日余辉', author: '汪杰瑞', year: '2026', desc: '', image: '71.jpg' },
                    { id: 'SW-PH037', title: '斗转星移', author: '梅宇轩', year: '2026', desc: '', image: '26.jpg' }
                  ]
                },
                {
                  id: 'photo-touch',
                  name: '触摸·人间的烟火',
                  description: '走入街巷与人群，触摸生活的温度，也感受人间的呼吸。寻常巷陌的祖孙背影、草地上迎风起飞的风筝、老街深处斑驳的旧影、江面上缓缓划过的渔舟、舞台下舒展投入的舞姿——我们用镜头定格那些真实而生动的瞬间。',
                  works: [
                    { id: 'SW-PH038', title: '眸', author: '杨斯语', year: '2026', desc: '', image: '5.jpg' },
                    { id: 'SW-PH039', title: '雨夜', author: '杨斯语', year: '2026', desc: '', image: '6.jpg' },
                    { id: 'SW-PH040', title: '童年', author: '陈易坤', year: '2026', desc: '', image: '30.jpg' },
                    { id: 'SW-PH041', title: '雨夜', author: '张跃轩', year: '2026', desc: '', image: '54.jpg' },
                    { id: 'SW-PH042', title: '祖孙俩', author: '杨斯语', year: '2026', desc: '', image: '52.jpg' },
                    { id: 'SW-PH043', title: '回眸', author: '邓志安', year: '2026', desc: '', image: '20.jpg' },
                    { id: 'SW-PH044', title: '等待', author: '沈厚宇', year: '2026', desc: '', image: '22.jpg' },
                    { id: 'SW-PH045', title: '城市', author: '解毅修', year: '2026', desc: '', image: '29.jpg' },
                    { id: 'SW-PH046', title: '蓝天翼影', author: '石宇轩', year: '2026', desc: '', image: '31.jpg' },
                    { id: 'SW-PH047', title: '守岁月', author: '杨斯语', year: '2026', desc: '', image: '50.jpg' },
                    { id: 'SW-PH048', title: '彩色的梦', author: '徐若涵', year: '2026', desc: '', image: '36.jpg' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },

    /* ============ 3. 流汐 —— 水墨生韵（书法、国画） ============ */
    {
      id: 'liuxi',
      name: '流汐',
      subtitle: '水墨生韵',
      mediumLabel: '书法 · 国画',
      accent: '#7BA89A',
      glow: 'rgba(123,168,154,0.35)',
      bgGradient: 'radial-gradient(ellipse at 50% 60%, #101a17 0%, #060a09 70%)',
      description: '墨分五色，水晕墨章。一笔一画间，见山川气韵，见人心波澜。流汐之上，墨色如潮，生生不息。',
      media: [
        {
          id: 'calligraphy',
          name: '书法',
          description: '笔墨纸砚，横竖撇捺，书写中国人的精神世界。',
          exhibitions: [
            {
              id: 'calligraphy-works',
              name: '墨痕心迹',
              coverHue: 160,
              description: '楷、行、草三体并陈，呈现书法艺术的丰富面貌。',
              themes: [
                {
                  id: 'calli-kai',
                  name: '楷书',
                  description: '端正严谨，一笔一画见功力。',
                  works: [
                    { id: 'LX-C01', title: '临九成宫', author: '韩书言', year: '2025', desc: '节临欧阳询《九成宫醴泉铭》，结构严谨，笔力遒劲。' },
                    { id: 'LX-C02', title: '心经', author: '柳眠舟', year: '2024', desc: '小楷《般若波罗蜜多心经》，清秀工整，心静如水。' },
                    { id: 'LX-C03', title: '岳阳楼记', author: '韩书言', year: '2025', desc: '范仲淹《岳阳楼记》全文，楷中带行，气韵贯通。' }
                  ]
                },
                {
                  id: 'calli-xing',
                  name: '行书',
                  description: '行云流水，介于楷草之间，最见性情。',
                  works: [
                    { id: 'LX-C04', title: '兰亭序节临', author: '柳眠舟', year: '2025', desc: '节临王羲之《兰亭集序》，笔法飘逸，气韵生动。' },
                    { id: 'LX-C05', title: '赤壁赋', author: '江浸月', year: '2024', desc: '苏轼《前赤壁赋》，行书流畅，如江上清风。' },
                    { id: 'LX-C06', title: '桃花源记', author: '韩书言', year: '2025', desc: '陶渊明《桃花源记》，行楷相间，意境悠远。' }
                  ]
                },
                {
                  id: 'calli-cao',
                  name: '草书',
                  description: '笔走龙蛇，纵情挥洒，最见精神。',
                  works: [
                    { id: 'LX-C07', title: '将进酒', author: '江浸月', year: '2025', desc: '李白《将进酒》，大草狂放，如黄河之水天上来。' },
                    { id: 'LX-C08', title: '沁园春·雪', author: '柳眠舟', year: '2024', desc: '毛泽东词，草书雄浑，气势磅礴。' },
                    { id: 'LX-C09', title: '自叙帖节临', author: '江浸月', year: '2025', desc: '节临怀素《自叙帖》，狂草奔放，笔意连绵。' }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'chinese-painting',
          name: '国画',
          description: '以水墨为骨，以丹青为衣，写胸中丘壑。',
          exhibitions: [
            {
              id: 'painting-works',
              name: '丹青写意',
              coverHue: 150,
              description: '山水与花鸟两大题材，展现国画的写意精神。',
              themes: [
                {
                  id: 'paint-landscape',
                  name: '山水',
                  description: '咫尺之内，瞻万里之遥；方寸之中，辨千寻之峻。',
                  works: [
                    { id: 'LX-G01', title: '溪山行旅', author: '温如玉', year: '2025', desc: '溪山之间行旅匆匆，远山近水层次分明。' },
                    { id: 'LX-G02', title: '烟雨江南', author: '秦观澜', year: '2024', desc: '江南烟雨朦胧，小桥流水人家，水墨淋漓。' },
                    { id: 'LX-G03', title: '秋山问道', author: '温如玉', year: '2025', desc: '秋山红叶，隐士问道，意境清幽。' },
                    { id: 'LX-G04', title: '寒林平野', author: '秦观澜', year: '2025', desc: '冬日寒林萧瑟，平野辽阔，以淡墨渲染。' },
                    { id: 'LX-G05', title: '春山欲雨', author: '温如玉', year: '2024', desc: '春山云雾缭绕，欲雨未雨，以泼墨表现。' },
                    { id: 'LX-G06', title: '松壑鸣泉', author: '秦观澜', year: '2025', desc: '松涛阵阵，飞泉流泻，以浓墨写松，淡墨写泉。' }
                  ]
                },
                {
                  id: 'paint-flower',
                  name: '花鸟',
                  description: '一花一世界，一鸟一天堂。',
                  works: [
                    { id: 'LX-G07', title: '荷趣', author: '苏亦安', year: '2025', desc: '荷塘清趣，蜻蜓点水，以没骨法写荷叶。' },
                    { id: 'LX-G08', title: '梅石图', author: '温如玉', year: '2024', desc: '寒梅倚石，暗香浮动，以圈瓣法写梅花。' },
                    { id: 'LX-G09', title: '竹雀', author: '苏亦安', year: '2025', desc: '翠竹摇曳，雀鸟栖枝，以写意笔法写竹。' },
                    { id: 'LX-G10', title: '牡丹', author: '秦观澜', year: '2025', desc: '牡丹盛开，雍容华贵，以工笔重彩写花瓣。' },
                    { id: 'LX-G11', title: '秋菊', author: '苏亦安', year: '2024', desc: '秋菊傲霜，以写意笔法表现菊花的坚韧。' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },

    /* ============ 4. 尘琢 —— 尘土塑形（泥塑、砖雕） ============ */
    {
      id: 'chenzhuo',
      name: '尘琢',
      subtitle: '尘土塑形',
      mediumLabel: '泥塑 · 砖雕',
      accent: '#B8896A',
      glow: 'rgba(184,137,106,0.35)',
      bgGradient: 'radial-gradient(ellipse at 40% 70%, #1e1410 0%, #0a0605 70%)',
      description: '抟土为形，刻砖为画。从尘土中来，经双手雕琢，化为有温度的艺术。尘琢之中，见匠心，见传承。',
      media: [
        {
          id: 'clay',
          name: '泥塑',
          description: '以泥土为材，以双手为工具，塑造有温度的形象。',
          exhibitions: [
            {
              id: 'clay-works',
              name: '抟土为形',
              coverHue: 25,
              description: '人物与器物两大系列，展现泥塑的朴拙之美。',
              themes: [
                {
                  id: 'clay-figure',
                  name: '人物',
                  description: '以泥塑形，以神写人，朴拙中见生动。',
                  works: [
                    { id: 'CZ-N01', title: '说书人', author: '范土生', year: '2025', desc: '说书人醒木一拍，口若悬河，神态惟妙惟肖。' },
                    { id: 'CZ-N02', title: '老妪', author: '孟泥人', year: '2024', desc: '老妪面容慈祥，皱纹深刻，手中纳着鞋底。' },
                    { id: 'CZ-N03', title: '牧童', author: '范土生', year: '2025', desc: '牧童骑牛吹笛，天真烂漫，造型简练。' },
                    { id: 'CZ-N04', title: '仕女', author: '孟泥人', year: '2025', desc: '仕女亭亭玉立，衣袂飘飘，施以彩绘。' }
                  ]
                },
                {
                  id: 'clay-object',
                  name: '器物',
                  description: '泥土经火的洗礼，成为日常可用之器。',
                  works: [
                    { id: 'CZ-N05', title: '鱼形壶', author: '范土生', year: '2024', desc: '壶身作鱼形，鱼口为流，鱼尾为柄，趣味盎然。' },
                    { id: 'CZ-N06', title: '蛙形水盂', author: '孟泥人', year: '2025', desc: '水盂作伏蛙形，背部开口，釉色青碧。' },
                    { id: 'CZ-N07', title: '兽面尊', author: '范土生', year: '2025', desc: '尊身饰兽面纹，古朴庄重，仿青铜器造型。' },
                    { id: 'CZ-N08', title: '莲花盏', author: '孟泥人', year: '2024', desc: '盏作莲花形，花瓣层叠，釉色白中透粉。' }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'brick-carving',
          name: '砖雕',
          description: '在青砖之上雕刻纹样与故事，是建筑上的艺术。',
          exhibitions: [
            {
              id: 'brick-works',
              name: '砖上春秋',
              coverHue: 20,
              description: '纹样与故事两类题材，呈现砖雕的精细之美。',
              themes: [
                {
                  id: 'brick-pattern',
                  name: '纹样',
                  description: '传统纹样在青砖上延续，寓意吉祥。',
                  works: [
                    { id: 'CZ-B01', title: '卷草纹', author: '石不言', year: '2025', desc: '卷草纹连绵不断，线条流畅，寓意生生不息。' },
                    { id: 'CZ-B02', title: '回纹', author: '砖上客', year: '2024', desc: '回纹方正有序，寓意吉利永长，富贵不断。' },
                    { id: 'CZ-B03', title: '莲纹', author: '石不言', year: '2025', desc: '莲花纹样清雅脱俗，寓意出淤泥而不染。' },
                    { id: 'CZ-B04', title: '云纹', author: '砖上客', year: '2025', desc: '祥云缭绕，如意吉祥，线条舒展自如。' }
                  ]
                },
                {
                  id: 'brick-story',
                  name: '故事',
                  description: '在砖上雕刻传统故事，方寸之间见春秋。',
                  works: [
                    { id: 'CZ-B05', title: '八仙过海', author: '石不言', year: '2024', desc: '八仙各持法器渡海，人物生动，海浪翻涌。' },
                    { id: 'CZ-B06', title: '桃园结义', author: '砖上客', year: '2025', desc: '刘关张桃园三结义，人物神态各异，背景桃花盛开。' },
                    { id: 'CZ-B07', title: '嫦娥奔月', author: '石不言', year: '2025', desc: '嫦娥飞升月宫，衣带飘扬，玉兔相随。' },
                    { id: 'CZ-B08', title: '渔樵问答', author: '砖上客', year: '2024', desc: '渔夫与樵夫对坐交谈，山水之间，悠然自得。' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

/* ============ 工具函数：数据查找 ============ */
const DataUtil = {
  // 从 Store 获取最新数据（若 Store 未初始化则用默认数据）
  _data() {
    if (typeof Store !== 'undefined' && Store.getData) {
      const d = Store.getData();
      if (d) return d;
    }
    return EXHIBITION_DATA;
  },
  getZone(zoneId) {
    return this._data().zones.find(z => z.id === zoneId);
  },
  getMedium(zoneId, mediumId) {
    const zone = this.getZone(zoneId);
    return zone ? zone.media.find(m => m.id === mediumId) : null;
  },
  getExhibition(zoneId, mediumId, exhibitionId) {
    const medium = this.getMedium(zoneId, mediumId);
    return medium ? medium.exhibitions.find(e => e.id === exhibitionId) : null;
  },
  getTheme(zoneId, mediumId, exhibitionId, themeId) {
    const ex = this.getExhibition(zoneId, mediumId, exhibitionId);
    return ex ? ex.themes.find(t => t.id === themeId) : null;
  },
  getWork(zoneId, mediumId, exhibitionId, themeId, workId) {
    const theme = this.getTheme(zoneId, mediumId, exhibitionId, themeId);
    return theme ? theme.works.find(w => w.id === workId) : null;
  },
  countZoneWorks(zone) {
    let count = 0;
    zone.media.forEach(m => m.exhibitions.forEach(e => e.themes.forEach(t => { count += t.works.length; })));
    return count;
  },
  countMediumWorks(medium) {
    let count = 0;
    medium.exhibitions.forEach(e => e.themes.forEach(t => { count += t.works.length; }));
    return count;
  },
  countExhibitionWorks(exhibition) {
    let count = 0;
    exhibition.themes.forEach(t => { count += t.works.length; });
    return count;
  },
  getAllExhibitionWorks(exhibition) {
    const works = [];
    exhibition.themes.forEach(t => t.works.forEach(w => works.push({ ...w, themeId: t.id, themeName: t.name })));
    return works;
  },
  getAllExhibitions(zone) {
    const list = [];
    zone.media.forEach(m => m.exhibitions.forEach(e => list.push({ ...e, mediumId: m.id, mediumName: m.name })));
    return list;
  },
  findWorkGlobal(workId) {
    const data = this._data();
    for (const zone of data.zones) {
      for (const medium of zone.media) {
        for (const ex of medium.exhibitions) {
          for (const theme of ex.themes) {
            const idx = theme.works.findIndex(w => w.id === workId);
            if (idx !== -1) {
              return { zone, medium, exhibition: ex, theme, work: theme.works[idx], index: idx };
            }
          }
        }
      }
    }
    return null;
  }
};

// 暴露默认数据供 Store 初始化
window.EXHIBITION_DATA = EXHIBITION_DATA;
