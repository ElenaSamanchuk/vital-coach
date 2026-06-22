package com.elenasamanchuk.vital;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(HealthStepsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
