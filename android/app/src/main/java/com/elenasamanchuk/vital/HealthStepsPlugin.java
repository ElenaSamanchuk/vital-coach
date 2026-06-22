package com.elenasamanchuk.vital;

import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Health Connect steps — читает шаги за сегодня, если приложение Health Connect установлено
 * и разрешения выданы. Без SDK возвращает 0 (ручной ввод в UI).
 */
@CapacitorPlugin(name = "HealthSteps")
public class HealthStepsPlugin extends Plugin {

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("available", Build.VERSION.SDK_INT >= 28);
        call.resolve(ret);
    }

    @PluginMethod
    public void getTodaySteps(PluginCall call) {
        JSObject ret = new JSObject();
        // Health Connect SDK требует отдельной настройки Gradle + permission flow.
        // Пока возвращаем 0 — UI предлагает ручной ввод; полная интеграция в следующем APK.
        ret.put("steps", 0);
        ret.put("source", "manual");
        call.resolve(ret);
    }
}
