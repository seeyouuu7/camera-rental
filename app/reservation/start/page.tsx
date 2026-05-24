"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, type CartSession } from "@/app/context/CartContext";

const TOTAL_STEPS = 4;

function today() {
  return new Date().toISOString().split("T")[0];
}
function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function ReservationStartPage() {
  const router = useRouter();
  const { setSession } = useCart();

  const [step, setStep] = useState(1);
  const [renterName, setRenterName] = useState("");
  const [teamInput, setTeamInput] = useState("");
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(tomorrow());

  function addTeamMember() {
    const name = teamInput.trim();
    if (!name || teamMembers.includes(name)) return;
    setTeamMembers((prev) => [...prev, name]);
    setTeamInput("");
  }

  function removeTeamMember(name: string) {
    setTeamMembers((prev) => prev.filter((m) => m !== name));
  }

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      const session: CartSession = { renterName, phone, teamMembers, startDate, endDate };
      setSession(session);
      router.push(`/?start=${startDate}&end=${endDate}`);
    }
  }

  function canProceed() {
    if (step === 1) return renterName.trim().length > 0;
    if (step === 3) return phone.trim().length >= 9;
    if (step === 4) return startDate <= endDate;
    return true;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        {/* 진행 바 */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-xs font-medium text-zinc-400">
            <span>Step {step} / {TOTAL_STEPS}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-zinc-900 transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">안녕하세요!</h2>
              <p className="mt-1 text-zinc-500">대여자 이름을 입력해주세요.</p>
              <div className="mt-6">
                <label className="block text-sm font-medium text-zinc-700">이름</label>
                <input
                  type="text"
                  value={renterName}
                  onChange={(e) => setRenterName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canProceed() && handleNext()}
                  placeholder="홍길동"
                  autoFocus
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">팀 구성원</h2>
              <p className="mt-1 text-zinc-500">함께 촬영할 팀원을 추가하세요. (선택)</p>
              <div className="mt-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={teamInput}
                    onChange={(e) => setTeamInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTeamMember()}
                    placeholder="팀원 이름 입력"
                    autoFocus
                    className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                  />
                  <button
                    onClick={addTeamMember}
                    className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
                  >
                    추가
                  </button>
                </div>
                {teamMembers.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {teamMembers.map((m) => (
                      <span
                        key={m}
                        className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
                      >
                        {m}
                        <button
                          onClick={() => removeTeamMember(m)}
                          className="text-zinc-400 hover:text-zinc-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-zinc-400">팀원 없이도 진행할 수 있어요.</p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">전화번호</h2>
              <p className="mt-1 text-zinc-500">연락받을 전화번호를 입력해주세요.</p>
              <div className="mt-6">
                <label className="block text-sm font-medium text-zinc-700">전화번호</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9\-+]/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && canProceed() && handleNext()}
                  placeholder="010-0000-0000"
                  autoFocus
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">대여 기간</h2>
              <p className="mt-1 text-zinc-500">장비를 사용할 날짜를 선택해주세요.</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700">시작일</label>
                  <input
                    type="date"
                    value={startDate}
                    min={today()}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (e.target.value > endDate) setEndDate(e.target.value);
                    }}
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">반납일</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>
              </div>
              {startDate && endDate && (
                <p className="mt-3 text-sm text-zinc-500">
                  총{" "}
                  <span className="font-semibold text-zinc-900">
                    {Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))}일
                  </span>{" "}
                  대여
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                ← 이전
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              {step === TOTAL_STEPS ? "장비 선택하기 →" : "다음 →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
