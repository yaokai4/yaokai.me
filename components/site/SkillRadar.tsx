type Skill = {
  id: string;
  name: string;
  category: string;
  level: number;
  description: string;
};

export function SkillRadar({ skills }: { skills: Skill[] }) {
  return (
    <div className="grid gap-4">
      {skills.map((skill) => (
        <div key={skill.id} className="rounded-md border border-[#DAE2EA] bg-white p-4 shadow-[0_1px_2px_rgba(15,45,78,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-950">{skill.name}</p>
              <p className="mt-1 text-xs text-slate-500">{skill.category}</p>
            </div>
            <span className="text-sm font-semibold text-indigo-700">{skill.level}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200/80">
            <div className="h-full rounded-full bg-indigo-800" style={{ width: `${skill.level}%` }} />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{skill.description}</p>
        </div>
      ))}
    </div>
  );
}
