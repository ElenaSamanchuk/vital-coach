import { Card } from "@/components/ui/Card";
import { CHECKUP } from "@/lib/product-copy";
import { getWeeklyMovementPlan } from "@/lib/fitness";
import { LAB_BUNDLES } from "@/lib/labs-schedule";
import { RESEARCH_FRAMEWORKS } from "@/lib/evidence-library";

export function GuidePageContent() {
  const movement = getWeeklyMovementPlan({
    insulinResistance: true,
    hypothyroidism: true,
    cortisolIssues: true,
    vitaminDDeficiency: true,
    b12Deficiency: true,
    hormoneIssues: true,
    pcosSuspected: false,
    endometriosis: false,
    vitaminAbsorption: false,
    surgeryRecovery: false,
  });

  return (
    <div className="space-y-4 pb-8">
      <Card title="Единая система питания" subtitle="Синтез подходов с доказательной базой">
        <div className="text-[13px] space-y-3">
          <p>
            <strong>Средиземноморский:</strong> овощи, рыба, оливковое — сердце, ИР, воспаление.
          </p>
          <p>
            <strong>Low-GI + carb timing:</strong> при ИР/СПКЯ — крахмал днём, порядок еды, ходьба после.
          </p>
          <p>
            <strong>High-protein deficit:</strong> 1,6–1,8 г/кг — мышцы и сытость в дефиците.
          </p>
          <p>
            <strong>Thyroid-aware:</strong> йод, белок, не &lt;1500 ккал, тироксин натощак.
          </p>
          <p>
            <strong>Cortisol-aware:</strong> сон, без ежедневного HIIT, «минимальный день» при стрессе.
          </p>
          <p>
            <strong>Cycle-synced:</strong> 4 фазы — разные шаблоны в коуче (меню на выбор).
          </p>
        </div>
      </Card>

      <Card title="Неделя движения" subtitle="Досуг + результат">
        <ul className="text-[13px] space-y-1">
          {movement.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Card>

      <Card title={CHECKUP.guideTitle}>
        {LAB_BUNDLES.slice(0, 4).map((b) => (
          <div key={b.id} className="mb-3 text-[13px]">
            <p className="font-semibold">{b.title}</p>
            <p className="text-[#86868b]">{b.when}</p>
          </div>
        ))}
      </Card>

      <Card title="Жизненные модели" subtitle={`${RESEARCH_FRAMEWORKS.length} исследований в синтезе`}>
        <ul className="text-[13px] space-y-2">
          {RESEARCH_FRAMEWORKS.slice(0, 8).map((f) => (
            <li key={f.id}>
              <strong>{f.name}</strong> ({f.authors}) — {f.summary}
            </li>
          ))}
        </ul>
        <p className="text-[12px] text-[#0071e3] mt-2">
          Полный каталог с интервенциями → вкладка «Жизнь»
        </p>
      </Card>

      <Card title="Что отслеживает приложение">
        <ul className="text-[13px] list-disc pl-4 space-y-1">
          <li>Вес и объёмы (талия — главный маркер жира)</li>
          <li>Калории, белок, вода, клетчатка</li>
          <li>Сон, энергия, настроение, стресс, кортизол</li>
          <li>Цикл и фаза</li>
          <li>Тренировки и прогулки после еды</li>
          <li>Тироксин и привычки</li>
          <li>Чекап с расписанием пересдач</li>
          <li>Динамика: что проседает → коуч корректирует</li>
          <li>Колесо жизни, PERMA, SDT, WHO-5, Ryff, Big Five, Икигай</li>
          <li>Работа, финансы, отношения, духовность, среда, творчество, рост</li>
          <li>Синтез: сон + стресс + колесо → единый план</li>
        </ul>
      </Card>
    </div>
  );
}
