"""
AI Service — generates tasks, documents, and service recommendations
for a given life event using rule-based templates.
Structured so an LLM call can replace the templates later.
"""

from datetime import datetime, timedelta, timezone
import os
import json
import logging
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)
# ── Life-event catalogue ─────────────────────────────────
LIFE_EVENTS = [
    {"value": "birth",        "label": "Раѓање на дете"},
    {"value": "marriage",     "label": "Склучување брак"},
    {"value": "divorce",      "label": "Развод"},
    {"value": "death",        "label": "Смртен случај"},
    {"value": "residence",    "label": "Промена на живеалиште"},
    {"value": "employment",   "label": "Вработување"},
    {"value": "retirement",   "label": "Пензионирање"},
    {"value": "education",    "label": "Образование"},
    {"value": "property",     "label": "Купување имот"},
    {"value": "vehicle",      "label": "Регистрација на возило"},
    {"value": "study-abroad", "label": "Студирање во странство"},
]


def get_life_events():
    return LIFE_EVENTS


# ── Task templates ───────────────────────────────────────
_TODOS: dict[str, list[dict]] = {
    "birth": [
        {"text": "Пријава на раѓање во матична служба", "description": "Посетете ја матичната служба во вашата општина за да го пријавите раѓањето на детето.", "days": 7, "priority": "high"},
        {"text": "Поднесување барање за извод од матична книга на родени", "description": "По пријавата на раѓањето, поднесете барање за добивање на извод.", "days": 14, "priority": "high"},
        {"text": "Регистрација за здравствено осигурување", "description": "Регистрирајте го детето во Фондот за здравствено осигурување.", "days": 21, "priority": "high"},
        {"text": "Поднесување барање за детски додаток", "description": "Поднесете барање во Центарот за социјална работа.", "days": 30, "priority": "medium"},
        {"text": "Добивање на ЕМБГ за детето", "description": "ЕМБГ се доделува автоматски по пријава на раѓањето. Проверете дали е добиен.", "days": 14, "priority": "high"},
    ],
    "marriage": [
        {"text": "Поднесување барање за склучување брак", "description": "Поднесете барање во матичната служба најмалку 30 дена пред планираниот датум.", "days": 7, "priority": "high"},
        {"text": "Обезбедување извод од матична книга на родени", "description": "Обезбедете изводи за двајцата партнери, не постари од 6 месеци.", "days": 14, "priority": "high"},
        {"text": "Обезбедување уверение за слободна брачна состојба", "description": "Добијте уверение од матичната служба дека не сте во брак.", "days": 14, "priority": "high"},
        {"text": "Закажување термин за венчавка", "description": "Закажете го датумот и времето за венчавката во матичната служба.", "days": 21, "priority": "medium"},
        {"text": "Промена на лични документи (доколку има)", "description": "По склучување на бракот, променете ги личните документи доколку има промена на презиме.", "days": 45, "priority": "low"},
    ],
    "divorce": [
        {"text": "Консултација со адвокат", "description": "Консултирајте се со адвокат специјализиран за семејно право.", "days": 7, "priority": "high"},
        {"text": "Поднесување тужба за развод", "description": "Поднесете тужба за развод во надлежниот основен суд.", "days": 30, "priority": "high"},
        {"text": "Обезбедување потребна документација", "description": "Подгответе ги сите потребни документи: извод од венчани, имотни листови.", "days": 21, "priority": "high"},
        {"text": "Присуство на судски рочишта", "description": "Присуствувајте на сите закажани судски рочишта.", "days": 60, "priority": "medium"},
        {"text": "Промена на лични документи", "description": "По правосилноста на пресудата, променете ги личните документи.", "days": 90, "priority": "low"},
    ],
    "death": [
        {"text": "Пријава на смртен случај", "description": "Пријавете го смртниот случај во матичната служба во рок од 3 дена.", "days": 3, "priority": "high"},
        {"text": "Добивање извод од матична книга на умрени", "description": "Побарајте извод од матична книга на умрени.", "days": 7, "priority": "high"},
        {"text": "Поднесување барање за оставинска постапка", "description": "Поднесете барање за оставинска постапка во надлежниот нотар или суд.", "days": 30, "priority": "high"},
        {"text": "Известување на банки и институции", "description": "Известете ги банките, осигурителните компании и други институции.", "days": 14, "priority": "medium"},
        {"text": "Регулирање на наследство", "description": "По завршување на оставинската постапка, регулирајте го наследството.", "days": 90, "priority": "low"},
    ],
    "residence": [
        {"text": "Поднесување барање за промена на адреса", "description": "Поднесете барање за промена на адреса во подрачната единица на МВР.", "days": 14, "priority": "high"},
        {"text": "Обезбедување доказ за сопственост/наем", "description": "Обезбедете имотен лист или договор за наем.", "days": 7, "priority": "high"},
        {"text": "Промена на адреса во лична карта", "description": "Променете ја адресата во личната карта во МВР.", "days": 30, "priority": "high"},
        {"text": "Известување на релевантни институции", "description": "Известете ги банките, работодавачот, здравствената установа.", "days": 30, "priority": "medium"},
        {"text": "Пререгистрација на возило (доколку има)", "description": "Доколку имате возило, пререгистрирајте го на новата адреса.", "days": 45, "priority": "low"},
    ],
    "employment": [
        {"text": "Подготовка на CV и мотивациско писмо", "description": "Подгответе ажуриран CV и мотивациско писмо.", "days": 7, "priority": "high"},
        {"text": "Регистрација во Агенција за вработување", "description": "Регистрирајте се како невработено лице.", "days": 14, "priority": "medium"},
        {"text": "Обезбедување потребни документи за вработување", "description": "Обезбедете диплома, уверенија, лекарско уверение.", "days": 14, "priority": "high"},
        {"text": "Потпишување договор за вработување", "description": "Внимателно прочитајте го и потпишете го договорот.", "days": 30, "priority": "high"},
        {"text": "Регистрација за социјално осигурување", "description": "Работодавачот треба да ве регистрира за пензиско и здравствено осигурување.", "days": 7, "priority": "high"},
    ],
    "retirement": [
        {"text": "Поднесување барање за пензија", "description": "Поднесете барање за старосна пензија во Фондот за ПИОСМ.", "days": 30, "priority": "high"},
        {"text": "Обезбедување работен стаж", "description": "Обезбедете потврда за работен стаж од сите работодавачи.", "days": 21, "priority": "high"},
        {"text": "Медицински преглед (доколку е потребно)", "description": "Доколку аплицирате за инвалидска пензија, направете медицински преглед.", "days": 30, "priority": "medium"},
        {"text": "Регулирање на здравствено осигурување", "description": "Регулирајте го здравственото осигурување како пензионер во ФЗОМ.", "days": 45, "priority": "medium"},
        {"text": "Известување на работодавач", "description": "Известете го работодавачот за датумот на пензионирање.", "days": 7, "priority": "high"},
    ],
    "education": [
        {"text": "Подготовка на потребна документација", "description": "Подгответе свидетелства, дипломи, извод од матична книга.", "days": 14, "priority": "high"},
        {"text": "Поднесување пријава за упис", "description": "Поднесете пријава за упис во образовната институција.", "days": 7, "priority": "high"},
        {"text": "Полагање на приемен испит (доколку има)", "description": "Подгответе се и полагајте приемен испит доколку е потребен.", "days": 21, "priority": "high"},
        {"text": "Уплата на школарина", "description": "Уплатете ја школарината во предвидениот рок.", "days": 30, "priority": "medium"},
        {"text": "Обезбедување на студентска легитимација", "description": "Добијте студентска легитимација од студентската служба.", "days": 45, "priority": "low"},
    ],
    "property": [
        {"text": "Проверка на имотен лист", "description": "Проверете го имотниот лист во Агенцијата за катастар.", "days": 7, "priority": "high"},
        {"text": "Ангажирање нотар", "description": "Ангажирајте нотар за подготовка и заверка на договорот.", "days": 14, "priority": "high"},
        {"text": "Подготовка на договор за купопродажба", "description": "Нотарот ќе го подготви договорот. Внимателно прочитајте ги сите услови.", "days": 21, "priority": "high"},
        {"text": "Уплата на данок на промет", "description": "Уплатете данок на промет на недвижности во УЈП (2-4%).", "days": 30, "priority": "high"},
        {"text": "Упис во катастар", "description": "Поднесете барање за упис на сопственост во Агенцијата за катастар.", "days": 45, "priority": "medium"},
    ],
    "vehicle": [
        {"text": "Обезбедување документи за возилото", "description": "Обезбедете сообраќајна дозвола, договор за купопродажба и лична карта.", "days": 7, "priority": "high"},
        {"text": "Технички преглед", "description": "Направете технички преглед на возилото во овластена станица.", "days": 14, "priority": "high"},
        {"text": "Осигурување на возилото", "description": "Склучете задолжително осигурување од автоодговорност.", "days": 14, "priority": "high"},
        {"text": "Плаќање на патарина и такси", "description": "Платете патарина и административни такси за регистрација.", "days": 21, "priority": "medium"},
        {"text": "Регистрација во МВР", "description": "Регистрирајте го возилото во подрачната единица на МВР.", "days": 30, "priority": "high"},
    ],
    "study-abroad": [
        {"text": "Истражување на универзитети", "description": "Истражете ги универзитетите и програмите кои ви одговараат во странство.", "days": 14, "priority": "high"},
        {"text": "Подготовка на апликација", "description": "Подгответе мотивациско писмо, препораки и други потребни документи.", "days": 30, "priority": "high"},
        {"text": "Аплицирање за стипендија", "description": "Проверете ги достапните стипендии и аплицирајте за финансиска поддршка.", "days": 45, "priority": "high"},
        {"text": "Добивање виза", "description": "Поднесете барање за студентска виза во амбасадата.", "days": 60, "priority": "high"},
        {"text": "Здравствено осигурување", "description": "Обезбедете здравствено осигурување валидно во странство.", "days": 45, "priority": "medium"},
        {"text": "Сместување", "description": "Обезбедете сместување - студентски дом или приватен стан.", "days": 60, "priority": "medium"},
        {"text": "Признавање на диплома", "description": "Информирајте се за постапката за признавање на вашите претходни дипломи.", "days": 30, "priority": "medium"},
    ],
}


# ── Document templates ───────────────────────────────────
_DOCUMENTS: dict[str, list[dict]] = {
    "birth": [
        {"name": "Извод од матична книга на родени (родители)", "description": "Оригинал или заверена копија", "required": True},
        {"name": "Лични карти на родителите", "description": "Копии од двете страни", "required": True},
        {"name": "Извод од матична книга на венчани", "description": "Доколку родителите се во брак", "required": False},
        {"name": "Потврда од болница", "description": "Документ за раѓање од здравствена установа", "required": True},
    ],
    "marriage": [
        {"name": "Извод од матична книга на родени", "description": "За двајцата партнери", "required": True},
        {"name": "Уверение за слободна брачна состојба", "description": "Не постаро од 6 месеци", "required": True},
        {"name": "Лични карти", "description": "Валидни документи за идентификација", "required": True},
        {"name": "Доказ за платена такса", "description": "Уплатница за административна такса", "required": True},
    ],
    "study-abroad": [
        {"name": "Пасош", "description": "Валиден пасош со минимум 6 месеци важност", "required": True},
        {"name": "Диплома/Свидетелство", "description": "Заверена копија од последната завршена диплома", "required": True},
        {"name": "Уверение за положени испити", "description": "Транскрипт со оценки", "required": True},
        {"name": "Мотивациско писмо", "description": "На англиски или јазикот на земјата", "required": True},
        {"name": "Препораки", "description": "Минимум две академски препораки", "required": True},
        {"name": "Доказ за јазична компетентност", "description": "TOEFL, IELTS или друг сертификат", "required": False},
    ],
}

_DEFAULT_DOCUMENTS = [
    {"name": "Лична карта", "description": "Валиден документ за идентификација", "required": True},
    {"name": "Барање/Апликација", "description": "Пополнет образец", "required": True},
    {"name": "Доказ за платена такса", "description": "Уплатница", "required": True},
]


# ── Service templates ────────────────────────────────────
_SERVICES: dict[str, list[dict]] = {
    "birth": [
        {"name": "Матична служба", "description": "Регистрација на раѓање и издавање документи", "location": "Општина на место на раѓање", "link": "https://uslugi.gov.mk"},
        {"name": "Фонд за здравствено осигурување", "description": "Регистрација на новороденче", "location": "Подрачна единица на ФЗОМ", "link": "https://fzo.org.mk"},
        {"name": "Центар за социјална работа", "description": "Барање за детски додаток", "location": "Според место на живеење", "link": "https://mtsp.gov.mk"},
    ],
    "marriage": [
        {"name": "Матична служба", "description": "Склучување брак и издавање документи", "location": "Општина", "link": "https://uslugi.gov.mk"},
        {"name": "МВР - Сектор за документи", "description": "Промена на лични документи", "location": "Подрачна единица на МВР", "link": "https://mvr.gov.mk"},
    ],
    "study-abroad": [
        {"name": "Министерство за образование и наука", "description": "Признавање на дипломи и информации за стипендии", "location": "Скопје", "link": "https://mon.gov.mk"},
        {"name": "Амбасада/Конзулат", "description": "Аплицирање за студентска виза", "location": "Според земја на студирање", "link": ""},
        {"name": "Фонд за здравствено осигурување", "description": "Информации за здравствено осигурување во странство", "location": "Скопје", "link": "https://fzo.org.mk"},
        {"name": "Нотар", "description": "Заверка на документи и превод", "location": "Локален нотар", "link": ""},
    ],
}

_DEFAULT_SERVICES = [
    {"name": "еУслуги портал", "description": "Централен портал за електронски услуги", "location": "Онлајн", "link": "https://uslugi.gov.mk"},
    {"name": "Општинска администрација", "description": "Локални услуги и документи", "location": "Ваша општина", "link": "https://uslugi.gov.mk"},
    {"name": "МВР", "description": "Лични документи и регистрации", "location": "Подрачна единица", "link": "https://mvr.gov.mk"},
]


# ── Public API ───────────────────────────────────────────
def generate_todos(life_event: str) -> list[dict]:
    templates = _TODOS.get(life_event, _TODOS["employment"])
    now = datetime.now(timezone.utc)
    return [
        {
            "text": t["text"],
            "description": t["description"],
            "deadline": (now + timedelta(days=t["days"])).isoformat(),
            "priority": t["priority"],
            "completed": False,
        }
        for t in templates
    ]


def generate_documents(life_event: str) -> list[dict]:
    return _DOCUMENTS.get(life_event, _DEFAULT_DOCUMENTS)


def generate_services(life_event: str) -> list[dict]:
    return _SERVICES.get(life_event, _DEFAULT_SERVICES)


async def generate_life_event_plan(life_event: str, description: str = "") -> dict:
    """
    Uses an LLM to generate a personalized life event plan based on the 
    event type and user description. 
    Falls back to the static templates if the LLM fails or no API key is provided.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_openai_api_key_here":
        logger.warning("No valid API key found, using static templates as fallback.")
        return {
            "todos": generate_todos(life_event),
            "documents": generate_documents(life_event),
            "services": generate_services(life_event)
        }

    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    
    system_prompt = """
    You are an AI assistant helping a citizen in North Macedonia navigate life events.
    Generate a personalized plan containing 'todos', 'documents', and 'services'.
    Return the result strictly as a valid JSON object matching this schema:
    {
      "todos": [
        {"text": "Task title", "description": "Details", "days": int, "priority": "high|medium|low"}
      ],
      "documents": [
        {"name": "Doc name", "description": "Doc details", "required": bool}
      ],
      "services": [
        {"name": "Service name", "description": "What it does", "location": "Address/Online", "link": "URL"}
      ]
    }
    All text should be in Macedonian language.
    """
    
    user_prompt = f"Life Event: {life_event}\nUser Details: {description}"
    
    try:
        response = await client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=1500
        )
        
        result_str = response.choices[0].message.content
        if not result_str:
            raise ValueError("Empty response from LLM")
            
        data = json.loads(result_str)
        
        # Add deadlines and completed fields to todos based on "days"
        now = datetime.now(timezone.utc)
        final_todos = []
        for t in data.get("todos", []):
            days = t.get("days", 7)
            final_todos.append({
                "text": t.get("text", "Task"),
                "description": t.get("description", ""),
                "deadline": (now + timedelta(days=days)).isoformat(),
                "priority": t.get("priority", "medium"),
                "completed": False,
            })
            
        return {
            "todos": final_todos,
            "documents": data.get("documents", []),
            "services": data.get("services", [])
        }
        
    except Exception as e:
        logger.error(f"OpenAI API failed: {str(e)}")
        # Fallback to static templates
        return {
            "todos": generate_todos(life_event),
            "documents": generate_documents(life_event),
            "services": generate_services(life_event)
        }
