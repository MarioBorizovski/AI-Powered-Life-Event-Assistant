export interface UploadedFile {
  id: string
  name: string
  size: number
  uploadedAt: string
}

export interface Request {
  id: string
  userId: string
  lifeEvent: string
  description: string
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: string
  documents?: string[]
  options?: string[]
  uploadedFiles?: UploadedFile[]
}

export interface RequestResult {
  requestId: string
  todos: TodoItem[]
  documents: DocumentItem[]
  services: ServiceItem[]
}

export interface TodoItem {
  id: string
  text: string
  description: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
}

export interface DocumentItem {
  id: string
  name: string
  description: string
  required: boolean
  downloadUrl?: string
  templateFileName?: string
}

export interface ServiceItem {
  id: string
  name: string
  description: string
  location: string
  link?: string
}

const REQUESTS_KEY = 'euslugi_requests'
const RESULTS_KEY = 'euslugi_results'

export const LIFE_EVENTS = [
  { value: 'birth', label: 'Раѓање на дете' },
  { value: 'marriage', label: 'Склучување брак' },
  { value: 'divorce', label: 'Развод' },
  { value: 'death', label: 'Смртен случај' },
  { value: 'residence', label: 'Промена на живеалиште' },
  { value: 'employment', label: 'Вработување' },
  { value: 'retirement', label: 'Пензионирање' },
  { value: 'education', label: 'Образование' },
  { value: 'property', label: 'Купување имот' },
  { value: 'vehicle', label: 'Регистрација на возило' },
  { value: 'study-abroad', label: 'Студирање во странство' },
]

interface TodoTemplate {
  text: string
  description: string
  daysFromNow: number
  priority: 'high' | 'medium' | 'low'
}

const generateTodos = (lifeEvent: string): TodoItem[] => {
  const todosMap: Record<string, TodoTemplate[]> = {
    birth: [
      { text: 'Пријава на раѓање во матична служба', description: 'Посетете ја матичната служба во вашата општина за да го пријавите раѓањето на детето. Потребни се лични карти на родителите и потврда од болница.', daysFromNow: 7, priority: 'high' },
      { text: 'Поднесување барање за извод од матична книга на родени', description: 'По пријавата на раѓањето, поднесете барање за добивање на извод од матична книга на родени за вашето дете.', daysFromNow: 14, priority: 'high' },
      { text: 'Регистрација за здравствено осигурување', description: 'Регистрирајте го детето во Фондот за здравствено осигурување за да добие здравствена заштита.', daysFromNow: 21, priority: 'high' },
      { text: 'Поднесување барање за детски додаток', description: 'Поднесете барање во Центарот за социјална работа за остварување на право на детски додаток.', daysFromNow: 30, priority: 'medium' },
      { text: 'Добивање на ЕМБГ за детето', description: 'ЕМБГ се доделува автоматски по пријава на раѓањето. Проверете дали е добиен.', daysFromNow: 14, priority: 'high' },
    ],
    marriage: [
      { text: 'Поднесување барање за склучување брак', description: 'Поднесете барање во матичната служба најмалку 30 дена пред планираниот датум на венчавка.', daysFromNow: 7, priority: 'high' },
      { text: 'Обезбедување извод од матична книга на родени', description: 'Обезбедете изводи од матична книга на родени за двајцата партнери, не постари од 6 месеци.', daysFromNow: 14, priority: 'high' },
      { text: 'Обезбедување уверение за слободна брачна состојба', description: 'Добијте уверение од матичната служба дека не сте во брак.', daysFromNow: 14, priority: 'high' },
      { text: 'Закажување термин за венчавка', description: 'Закажете го датумот и времето за венчавката во матичната служба.', daysFromNow: 21, priority: 'medium' },
      { text: 'Промена на лични документи (доколку има)', description: 'По склучување на бракот, доколку има промена на презиме, променете ги личните документи.', daysFromNow: 45, priority: 'low' },
    ],
    divorce: [
      { text: 'Консултација со адвокат', description: 'Консултирајте се со адвокат специјализиран за семејно право за да ги разберете вашите права и опции.', daysFromNow: 7, priority: 'high' },
      { text: 'Поднесување тужба за развод', description: 'Поднесете тужба за развод во надлежниот основен суд преку вашиот адвокат.', daysFromNow: 30, priority: 'high' },
      { text: 'Обезбедување потребна документација', description: 'Подгответе ги сите потребни документи: извод од венчани, имотни листови, документи за деца.', daysFromNow: 21, priority: 'high' },
      { text: 'Присуство на судски рочишта', description: 'Присуствувајте на сите закажани судски рочишта. Датумите ќе ви бидат доставени од судот.', daysFromNow: 60, priority: 'medium' },
      { text: 'Промена на лични документи', description: 'По правосилноста на пресудата, променете ги личните документи доколку има промена на презиме.', daysFromNow: 90, priority: 'low' },
    ],
    death: [
      { text: 'Пријава на смртен случај', description: 'Пријавете го смртниот случај во матичната служба во рок од 3 дена. Потребна е потврда за смрт од лекар.', daysFromNow: 3, priority: 'high' },
      { text: 'Добивање извод од матична книга на умрени', description: 'Побарајте извод од матична книга на умрени од матичната служба.', daysFromNow: 7, priority: 'high' },
      { text: 'Поднесување барање за оставинска постапка', description: 'Поднесете барање за оставинска постапка во надлежниот нотар или суд.', daysFromNow: 30, priority: 'high' },
      { text: 'Известување на банки и институции', description: 'Известете ги банките, осигурителните компании и други институции за смртниот случај.', daysFromNow: 14, priority: 'medium' },
      { text: 'Регулирање на наследство', description: 'По завршување на оставинската постапка, регулирајте го наследството според решението.', daysFromNow: 90, priority: 'low' },
    ],
    residence: [
      { text: 'Поднесување барање за промена на адреса', description: 'Поднесете барање за промена на адреса во подрачната единица на МВР.', daysFromNow: 14, priority: 'high' },
      { text: 'Обезбедување доказ за сопственост/наем', description: 'Обезбедете имотен лист или договор за наем како доказ за новата адреса.', daysFromNow: 7, priority: 'high' },
      { text: 'Промена на адреса во лична карта', description: 'Променете ја адресата во личната карта во МВР.', daysFromNow: 30, priority: 'high' },
      { text: 'Известување на релевантни институции', description: 'Известете ги банките, работодавачот, здравствената установа за новата адреса.', daysFromNow: 30, priority: 'medium' },
      { text: 'Пререгистрација на возило (доколку има)', description: 'Доколку имате возило, пререгистрирајте го на новата адреса.', daysFromNow: 45, priority: 'low' },
    ],
    employment: [
      { text: 'Подготовка на CV и мотивациско писмо', description: 'Подгответе ажуриран CV и мотивациско писмо прилагодено за работната позиција.', daysFromNow: 7, priority: 'high' },
      { text: 'Регистрација во Агенција за вработување', description: 'Регистрирајте се како невработено лице во Агенцијата за вработување.', daysFromNow: 14, priority: 'medium' },
      { text: 'Обезбедување потребни документи за вработување', description: 'Обезбедете диплома, уверенија, лекарско уверение и други потребни документи.', daysFromNow: 14, priority: 'high' },
      { text: 'Потпишување договор за вработување', description: 'Внимателно прочитајте го и потпишете го договорот за вработување.', daysFromNow: 30, priority: 'high' },
      { text: 'Регистрација за социјално осигурување', description: 'Работодавачот треба да ве регистрира за пензиско и здравствено осигурување.', daysFromNow: 7, priority: 'high' },
    ],
    retirement: [
      { text: 'Поднесување барање за пензија', description: 'Поднесете барање за старосна пензија во Фондот за ПИОСМ најмалку 30 дена пред пензионирање.', daysFromNow: 30, priority: 'high' },
      { text: 'Обезбедување работен стаж', description: 'Обезбедете потврда за работен стаж од сите работодавачи каде сте биле вработени.', daysFromNow: 21, priority: 'high' },
      { text: 'Медицински преглед (доколку е потребно)', description: 'Доколку аплицирате за инвалидска пензија, направете медицински преглед.', daysFromNow: 30, priority: 'medium' },
      { text: 'Регулирање на здравствено осигурување', description: 'Регулирајте го здравственото осигурување како пензионер во ФЗОМ.', daysFromNow: 45, priority: 'medium' },
      { text: 'Известување на работодавач', description: 'Известете го работодавачот за датумот на пензионирање најмалку 30 дена однапред.', daysFromNow: 7, priority: 'high' },
    ],
    education: [
      { text: 'Подготовка на потребна документација', description: 'Подгответе свидетелства, дипломи, извод од матична книга и други потребни документи.', daysFromNow: 14, priority: 'high' },
      { text: 'Поднесување пријава за упис', description: 'Поднесете пријава за упис во образовната институција во рок на конкурсот.', daysFromNow: 7, priority: 'high' },
      { text: 'Полагање на приемен испит (доколку има)', description: 'Подгответе се и полагајте приемен испит доколку е потребен за упис.', daysFromNow: 21, priority: 'high' },
      { text: 'Уплата на школарина', description: 'Уплатете ја школарината во предвидениот рок по објавување на резултатите.', daysFromNow: 30, priority: 'medium' },
      { text: 'Обезбедување на студентска легитимација', description: 'Добијте студентска легитимација од студентската служба.', daysFromNow: 45, priority: 'low' },
    ],
    property: [
      { text: 'Проверка на имотен лист', description: 'Проверете го имотниот лист во Агенцијата за катастар за да потврдите сопственост и товари.', daysFromNow: 7, priority: 'high' },
      { text: 'Ангажирање нотар', description: 'Ангажирајте нотар за подготовка и заверка на договорот за купопродажба.', daysFromNow: 14, priority: 'high' },
      { text: 'Подготовка на договор за купопродажба', description: 'Нотарот ќе го подготви договорот. Внимателно прочитајте ги сите услови.', daysFromNow: 21, priority: 'high' },
      { text: 'Уплата на данок на промет', description: 'Уплатете данок на промет на недвижности во УЈП (2-4% од вредноста).', daysFromNow: 30, priority: 'high' },
      { text: 'Упис во катастар', description: 'Поднесете барање за упис на сопственост во Агенцијата за катастар.', daysFromNow: 45, priority: 'medium' },
    ],
    vehicle: [
      { text: 'Обезбедување документи за возилото', description: 'Обезбедете сообраќајна дозвола, договор за купопродажба и лична карта.', daysFromNow: 7, priority: 'high' },
      { text: 'Технички преглед', description: 'Направете технички преглед на возилото во овластена станица.', daysFromNow: 14, priority: 'high' },
      { text: 'Осигурување на возилото', description: 'Склучете задолжително осигурување од автоодговорност и каско (опционално).', daysFromNow: 14, priority: 'high' },
      { text: 'Плаќање на патарина и такси', description: 'Платете патарина и административни такси за регистрација.', daysFromNow: 21, priority: 'medium' },
      { text: 'Регистрација во МВР', description: 'Регистрирајте го возилото во подрачната единица на МВР.', daysFromNow: 30, priority: 'high' },
    ],
    'study-abroad': [
      { text: 'Истражување на универзитети', description: 'Истражете ги универзитетите и програмите кои ви одговараат во странство.', daysFromNow: 14, priority: 'high' },
      { text: 'Подготовка на апликација', description: 'Подгответе мотивациско писмо, препораки и други потребни документи за апликација.', daysFromNow: 30, priority: 'high' },
      { text: 'Аплицирање за стипендија', description: 'Проверете ги достапните стипендии и аплицирајте за финансиска поддршка.', daysFromNow: 45, priority: 'high' },
      { text: 'Добивање виза', description: 'Поднесете барање за студентска виза во амбасадата на земјата каде ќе студирате.', daysFromNow: 60, priority: 'high' },
      { text: 'Здравствено осигурување', description: 'Обезбедете здравствено осигурување валидно во странство.', daysFromNow: 45, priority: 'medium' },
      { text: 'Сместување', description: 'Обезбедете сместување - студентски дом или приватен стан.', daysFromNow: 60, priority: 'medium' },
      { text: 'Признавање на диплома', description: 'Информирајте се за постапката за признавање на вашите претходни дипломи.', daysFromNow: 30, priority: 'medium' },
    ],
  }
  
  const today = new Date()
  
  return (todosMap[lifeEvent] || todosMap.birth).map((todo, index) => {
    const deadline = new Date(today)
    deadline.setDate(deadline.getDate() + todo.daysFromNow)
    
    return {
      id: `todo-${index}`,
      text: todo.text,
      description: todo.description,
      deadline: deadline.toISOString(),
      priority: todo.priority,
      completed: false,
    }
  })
}

const generateDocuments = (lifeEvent: string): DocumentItem[] => {
  const docsMap: Record<string, DocumentItem[]> = {
    birth: [
      { id: 'd1', name: 'Извод од матична книга на родени (род��тели)', description: 'Оригинал или заверена копија', required: true },
      { id: 'd2', name: 'Лични карти на родителите', description: 'Копии од двете страни', required: true },
      { id: 'd3', name: 'Извод од матична книга на венчани', description: 'Доколку родителите се во брак', required: false },
      { id: 'd4', name: 'Потврда од болница', description: 'Документ за раѓање од здравствена установа', required: true },
    ],
    marriage: [
      { id: 'd1', name: 'Извод од матична книга на родени', description: 'За двајцата партнери', required: true },
      { id: 'd2', name: 'Уверение за слободна брачна состојба', description: 'Не постаро од 6 месеци', required: true },
      { id: 'd3', name: 'Лични карти', description: 'Валидни документи за идентификација', required: true },
      { id: 'd4', name: 'Доказ за платена такса', description: 'Уплатница за административна такса', required: true },
    ],
    'study-abroad': [
      { id: 'd1', name: 'Пасош', description: 'Валиден пасош со минимум 6 месеци важност', required: true },
      { id: 'd2', name: 'Диплома/Свидетелство', description: 'Заверена копија од последната завршена диплома', required: true },
      { id: 'd3', name: 'Уверение за положени испити', description: 'Транскрипт со оценки', required: true },
      { id: 'd4', name: 'Мотивациско писмо', description: 'На англиски или јазикот на земјата', required: true },
      { id: 'd5', name: 'Препораки', description: 'Минимум две академски препораки', required: true },
      { id: 'd6', name: 'Доказ за јазична компетентност', description: 'TOEFL, IELTS или друг сертификат', required: false },
    ],
    default: [
      { id: 'd1', name: 'Лична карта', description: 'Валиден документ за идентификација', required: true },
      { id: 'd2', name: 'Барање/Апликација', description: 'Пополнет образец', required: true },
      { id: 'd3', name: 'Доказ за платена такса', description: 'Уплатница', required: true },
    ],
  }
  
  return docsMap[lifeEvent] || docsMap.default
}

const generateServices = (lifeEvent: string): ServiceItem[] => {
  const servicesMap: Record<string, ServiceItem[]> = {
    birth: [
      { id: 's1', name: 'Матична служба', description: 'Регистрација на раѓање и издавање документи', location: 'Општина на место на раѓање', link: 'https://uslugi.gov.mk' },
      { id: 's2', name: 'Фонд за здравствено осигурување', description: 'Регистрација на новороденче', location: 'Подрачна единица на ФЗОМ', link: 'https://fzo.org.mk' },
      { id: 's3', name: 'Центар за социјална работа', description: 'Барање за детски додаток', location: 'Според место на живеење', link: 'https://mtsp.gov.mk' },
    ],
    marriage: [
      { id: 's1', name: 'Матична служба', description: 'Склучување брак и издавање документи', location: 'Општина', link: 'https://uslugi.gov.mk' },
      { id: 's2', name: 'МВР - Сектор за документи', description: 'Промена на лични документи', location: 'Подрачна единица на МВР', link: 'https://mvr.gov.mk' },
    ],
    'study-abroad': [
      { id: 's1', name: 'Министерство за образование и наука', description: 'Признавање на дипломи и информации за стипендии', location: 'Скопје', link: 'https://mon.gov.mk' },
      { id: 's2', name: 'Амбасада/Конзулат', description: 'Аплицирање за студентска виза', location: 'Според земја на студирање', link: '' },
      { id: 's3', name: 'Фонд за здравствено осигурување', description: 'Информации за здравствено осигурување во странство', location: 'Скопје', link: 'https://fzo.org.mk' },
      { id: 's4', name: 'Нотар', description: 'Заверка на документи и превод', location: 'Локален нотар', link: '' },
    ],
    default: [
      { id: 's1', name: 'еУслуги портал', description: 'Централен портал за електронски услуги', location: 'Онлајн', link: 'https://uslugi.gov.mk' },
      { id: 's2', name: 'Општинска администрација', description: 'Локални услуги и документи', location: 'Ваша општина', link: 'https://uslugi.gov.mk' },
      { id: 's3', name: 'МВР', description: 'Лични документи и регистрации', location: 'Подрачна единица', link: 'https://mvr.gov.mk' },
    ],
  }
  
  return servicesMap[lifeEvent] || servicesMap.default
}

export const mockApi = {
  getRequests: async (userId?: string): Promise<Request[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(REQUESTS_KEY)
    const requests: Request[] = stored ? JSON.parse(stored) : []
    
    if (userId) {
      return requests.filter((r) => r.userId === userId)
    }
    
    return requests
  },

  createRequest: async (
    userId: string,
    data: {
      lifeEvent: string
      description: string
      options?: string[]
      documents?: string[]
    }
  ): Promise<{ request: Request; result: RequestResult }> => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    const stored = localStorage.getItem(REQUESTS_KEY)
    const requests: Request[] = stored ? JSON.parse(stored) : []
    
    const newRequest: Request = {
      id: `req-${Date.now()}`,
      userId,
      lifeEvent: data.lifeEvent,
      description: data.description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      documents: data.documents,
      options: data.options,
    }
    
    const updatedRequests = [...requests, newRequest]
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(updatedRequests))
    
    const result: RequestResult = {
      requestId: newRequest.id,
      todos: generateTodos(data.lifeEvent),
      documents: generateDocuments(data.lifeEvent),
      services: generateServices(data.lifeEvent),
    }
    
    const storedResults = localStorage.getItem(RESULTS_KEY)
    const results: RequestResult[] = storedResults ? JSON.parse(storedResults) : []
    results.push(result)
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results))
    
    return { request: newRequest, result }
  },

  getRequestResult: async (requestId: string): Promise<RequestResult | null> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    if (typeof window === 'undefined') return null
    
    const stored = localStorage.getItem(RESULTS_KEY)
    const results: RequestResult[] = stored ? JSON.parse(stored) : []
    
    return results.find((r) => r.requestId === requestId) || null
  },

  updateRequestStatus: async (requestId: string, status: Request['status']): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    const stored = localStorage.getItem(REQUESTS_KEY)
    const requests: Request[] = stored ? JSON.parse(stored) : []
    
    const updated = requests.map((r) =>
      r.id === requestId ? { ...r, status } : r
    )
    
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated))
  },

  deleteRequest: async (requestId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    const stored = localStorage.getItem(REQUESTS_KEY)
    const requests: Request[] = stored ? JSON.parse(stored) : []
    
    const updated = requests.filter((r) => r.id !== requestId)
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated))
    
    // Also delete results
    const storedResults = localStorage.getItem(RESULTS_KEY)
    const results: RequestResult[] = storedResults ? JSON.parse(storedResults) : []
    const updatedResults = results.filter((r) => r.requestId !== requestId)
    localStorage.setItem(RESULTS_KEY, JSON.stringify(updatedResults))
  },

  updateTodoItem: async (requestId: string, todoId: string, completed: boolean): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    
    const stored = localStorage.getItem(RESULTS_KEY)
    const results: RequestResult[] = stored ? JSON.parse(stored) : []
    
    const updated = results.map((r) => {
      if (r.requestId === requestId) {
        return {
          ...r,
          todos: r.todos.map((t) =>
            t.id === todoId ? { ...t, completed } : t
          ),
        }
      }
      return r
    })
    
    localStorage.setItem(RESULTS_KEY, JSON.stringify(updated))
  },

  getAllUsers: async (): Promise<{ id: string; email: string; name: string; role: string }[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem('euslugi_users')
    const users = stored ? JSON.parse(stored) : []
    
    return users.map((u: { id: string; email: string; name: string; role: string; password?: string }) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
    }))
  },

  deleteUser: async (userId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    const stored = localStorage.getItem('euslugi_users')
    const users = stored ? JSON.parse(stored) : []
    
    const updated = users.filter((u: { id: string }) => u.id !== userId)
    localStorage.setItem('euslugi_users', JSON.stringify(updated))
  },

  updateUserRole: async (userId: string, role: 'user' | 'admin'): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    const stored = localStorage.getItem('euslugi_users')
    const users = stored ? JSON.parse(stored) : []
    
    const updated = users.map((u: { id: string; role: string }) => 
      u.id === userId ? { ...u, role } : u
    )
    localStorage.setItem('euslugi_users', JSON.stringify(updated))
  },

  getSystemStats: async (): Promise<{
    totalUsers: number
    totalRequests: number
    pendingRequests: number
    completedRequests: number
    cancelledRequests: number
    requestsByLifeEvent: { lifeEvent: string; count: number }[]
    recentActivity: { date: string; requests: number }[]
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    if (typeof window === 'undefined') {
      return {
        totalUsers: 0,
        totalRequests: 0,
        pendingRequests: 0,
        completedRequests: 0,
        cancelledRequests: 0,
        requestsByLifeEvent: [],
        recentActivity: [],
      }
    }
    
    const usersStored = localStorage.getItem('euslugi_users')
    const users = usersStored ? JSON.parse(usersStored) : []
    
    const requestsStored = localStorage.getItem(REQUESTS_KEY)
    const requests: Request[] = requestsStored ? JSON.parse(requestsStored) : []
    
    const requestsByLifeEvent = LIFE_EVENTS.map((event) => ({
      lifeEvent: event.label,
      count: requests.filter((r) => r.lifeEvent === event.value).length,
    })).filter((item) => item.count > 0)
    
    // Generate last 7 days activity
    const recentActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const count = requests.filter((r) => r.createdAt.startsWith(dateStr)).length
      recentActivity.push({ date: dateStr, requests: count })
    }
    
    return {
      totalUsers: users.length,
      totalRequests: requests.length,
      pendingRequests: requests.filter((r) => r.status === 'pending').length,
      completedRequests: requests.filter((r) => r.status === 'completed').length,
      cancelledRequests: requests.filter((r) => r.status === 'cancelled').length,
      requestsByLifeEvent,
      recentActivity,
    }
  },

  getLifeEventsConfig: async (): Promise<typeof LIFE_EVENTS> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return LIFE_EVENTS
  },

  getUserWithDetails: async (userId: string): Promise<{
    id: string
    email: string
    name: string
    role: string
    personalInfo?: {
      embg: string
      firstName: string
      lastName: string
      dateOfBirth: string
      placeOfBirth: string
      address: string
      city: string
      postalCode: string
      phoneNumber: string
      idCardNumber: string
    }
    requestsCount: number
    completedRequestsCount: number
  } | null> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    if (typeof window === 'undefined') return null
    
    const usersStored = localStorage.getItem('euslugi_users')
    const users = usersStored ? JSON.parse(usersStored) : []
    
    const user = users.find((u: { id: string }) => u.id === userId)
    if (!user) return null
    
    const requestsStored = localStorage.getItem(REQUESTS_KEY)
    const requests: Request[] = requestsStored ? JSON.parse(requestsStored) : []
    const userRequests = requests.filter((r) => r.userId === userId)
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      personalInfo: user.personalInfo,
      requestsCount: userRequests.length,
      completedRequestsCount: userRequests.filter((r) => r.status === 'completed').length,
    }
  },

  // Admin Task Management
  addTodoItem: async (requestId: string, todo: TodoItem): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    
    const stored = localStorage.getItem(RESULTS_KEY)
    const results: RequestResult[] = stored ? JSON.parse(stored) : []
    
    const updated = results.map((r) => {
      if (r.requestId === requestId) {
        return { ...r, todos: [...r.todos, todo] }
      }
      return r
    })
    
    localStorage.setItem(RESULTS_KEY, JSON.stringify(updated))
  },

  updateTodoItemFull: async (requestId: string, todo: TodoItem): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    
    const stored = localStorage.getItem(RESULTS_KEY)
    const results: RequestResult[] = stored ? JSON.parse(stored) : []
    
    const updated = results.map((r) => {
      if (r.requestId === requestId) {
        return {
          ...r,
          todos: r.todos.map((t) => (t.id === todo.id ? todo : t)),
        }
      }
      return r
    })
    
    localStorage.setItem(RESULTS_KEY, JSON.stringify(updated))
  },

  deleteTodoItem: async (requestId: string, todoId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    
    const stored = localStorage.getItem(RESULTS_KEY)
    const results: RequestResult[] = stored ? JSON.parse(stored) : []
    
    const updated = results.map((r) => {
      if (r.requestId === requestId) {
        return {
          ...r,
          todos: r.todos.filter((t) => t.id !== todoId),
        }
      }
      return r
    })
    
    localStorage.setItem(RESULTS_KEY, JSON.stringify(updated))
  },

  // Get user's requests for admin
  getUserRequests: async (userId: string): Promise<Request[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(REQUESTS_KEY)
    const requests: Request[] = stored ? JSON.parse(stored) : []
    
    return requests.filter((r) => r.userId === userId)
  },
}
