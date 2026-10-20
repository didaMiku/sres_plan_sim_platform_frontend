// 5 类数据中"需要上传 CSV"的 4 类时序数据，以及各自的数据库字段
// 说明：等后端 /api/schema/types 接口做好后，把这份常量换成接口返回即可

export interface FieldDef {
  key: string // 数据库字段名
  name: string // 中文名
  unit: string // 单位
  required: boolean // 是否必填
}

export interface TypeDef {
  code: string // 类型代码，传给后端
  name: string // 显示名
  desc: string // 一行说明
  fields: FieldDef[]
}

export const DATA_TYPES: TypeDef[] = [
  {
    code: 'source',
    name: '源荷气象数据',
    desc: '对应 03_小时级源荷气象电价数据.csv',
    fields: [
      { key: 'ts', name: '时间戳', unit: '', required: true },
      { key: 'wind_speed', name: '风速', unit: 'm/s', required: true },
      { key: 'ghi', name: '总辐照度', unit: 'W/m²', required: true },
      { key: 'temperature', name: '温度', unit: '℃', required: false },
      { key: 'load_mw', name: '有功负荷', unit: 'MW', required: true },
      { key: 'buy_price', name: '购电价', unit: '元/kWh', required: false },
    ],
  },
  {
    code: 'typical_day',
    name: '典型日曲线',
    desc: '对应 04_典型日15分钟运行曲线_带日期.csv',
    fields: [
      { key: 'ts', name: '时间戳', unit: '', required: true },
      { key: 'pv_available_mw', name: '光伏可用出力', unit: 'MW', required: true },
      { key: 'load_mw', name: '负荷', unit: 'MW', required: true },
    ],
  },
  {
    code: 'simulation',
    name: '运行仿真数据',
    desc: '对应 05_风光负荷同步出力数据.csv',
    fields: [
      { key: 'ts', name: '时间戳', unit: '', required: true },
      { key: 'wind_speed', name: '风速', unit: 'm/s', required: false },
      { key: 'temperature', name: '温度', unit: '℃', required: false },
      { key: 'ghi', name: '总辐照度', unit: 'W/m²', required: false },
      { key: 'wind_power_mw', name: '风电出力', unit: 'MW', required: false },
      { key: 'pv_power_mw', name: '光伏出力', unit: 'MW', required: false },
      { key: 'load_mw', name: '负荷', unit: 'MW', required: false },
      { key: 'battery_charge_mw', name: '储能充电', unit: 'MW', required: false },
      { key: 'battery_discharge_mw', name: '储能放电', unit: 'MW', required: false },
      { key: 'soc', name: '荷电状态', unit: '', required: false },
      { key: 'grid_buy_mw', name: '外网购电', unit: 'MW', required: false },
      { key: 'grid_sell_mw', name: '外网售电', unit: 'MW', required: false },
      { key: 'curtailment_mw', name: '弃风弃光', unit: 'MW', required: false },
      { key: 'balance_error_mw', name: '功率平衡误差', unit: 'MW', required: false },
    ],
  },
  {
    code: 'tariff',
    name: '分时电价',
    desc: '对应 07_华东分时电价数据.xlsx',
    fields: [
      { key: 'hour', name: '时段（0~23）', unit: 'h', required: true },
      { key: 'price', name: '购电价', unit: '元/kWh', required: true },
      { key: 'sell_price', name: '上网电价', unit: '元/kWh', required: false },
      { key: 'period_name', name: '时段类型', unit: '', required: false },
    ],
  },
]
