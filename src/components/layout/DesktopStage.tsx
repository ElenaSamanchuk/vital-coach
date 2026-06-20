"use client";

import type { ReactNode } from "react";
import { Leaf, Smartphone, Shield, Sparkles } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/lib/app-config";
import { BRAND_GRADIENT } from "@/lib/design-tokens";

/**
 * На десктопе — телефон в центре экрана + промо сбоку.
 * На мобилке и в APK — прозрачная обёртка, приложение на весь экран.
 */
export function DesktopStage({ children }: { children: ReactNode }) {
  return (
    <div className="vc-desktop-stage">
      <div className="vc-device-chassis">
        <div className="vc-device-island" aria-hidden />
        <div className="vc-device-screen">{children}</div>
        <div className="vc-device-home-bar" aria-hidden />
      </div>

      <aside className="vc-desktop-aside" aria-label="О приложении">
        <div
          className="vc-desktop-aside-icon"
          style={{ background: BRAND_GRADIENT }}
        >
          <Leaf size={32} className="text-white" />
        </div>
        <h2 className="vc-desktop-aside-title">{APP_NAME}</h2>
        <p className="vc-desktop-aside-tagline">{APP_TAGLINE}</p>
        <ul className="vc-desktop-aside-list">
          <li>
            <Shield size={16} />
            Без регистрации и пароля
          </li>
          <li>
            <Sparkles size={16} />
            Еда, движение и дневник — в одном месте
          </li>
          <li>
            <Smartphone size={16} />
            Данные остаются на вашем устройстве
          </li>
        </ul>
        <p className="vc-desktop-aside-hint">
          На телефоне откройте сайт и добавьте на главный экран — будет как приложение.
        </p>
      </aside>
    </div>
  );
}
