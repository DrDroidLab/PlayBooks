import pandas as pd
from adtk.data import validate_series
from adtk.detector import QuantileAD, PersistAD, LevelShiftAD, VolatilityShiftAD


def identify_spikes_and_drops(df: pd.DataFrame):
    data = validate_series(df['value'])

    # Define a detector for spikes and drops using quantiles
    quantile_ad = QuantileAD(high=0.99, low=0.01)  # Adjust thresholds as needed

    # Detect spikes & drops anomalies
    spikes_and_drops = quantile_ad.fit_detect(data)

    # Handle any index misalignment
    df['spike_or_drop'] = spikes_and_drops.reindex(df.index).fillna(0).astype(int)

    # try:
    #     plot(data, anomaly=spikes_and_drops, ts_linewidth=1, ts_markersize=3, anomaly_markersize=5,
    #          anomaly_color='red', anomaly_tag="marker");
    # except Exception as e:
    #     raise e

    return df


def identify_step_jump(df):
    data = validate_series(df['value'])

    # Define a detector for spikes and drops using quantiles
    # Define a detector for step changes
    # Adjust parameters based on your specific time window and sensitivity
    persist_ad = PersistAD(side='positive', c=1.5)

    # Detect step change anomalies
    step_changes = persist_ad.fit_detect(data).fillna(False)

    # Handle any index misalignment
    df['step_change'] = step_changes.reindex(df.index).fillna(0).astype(int)

    # try:
    #   plot(data, anomaly=step_changes, ts_linewidth=1, ts_markersize=3, anomaly_color='red')
    # except Exception as e:
    #   raise e

    return df


def identify_level_shift(df):
    data = validate_series(df['value'])

    # Define a detector for LevelShift
    level_shift_ad = LevelShiftAD(c=6.0, side='both', window=5)
    level_shift = level_shift_ad.fit_detect(data)

    # Handle any index misalignment
    df['level_shift'] = level_shift.reindex(df.index).fillna(0).astype(int)

    # try:
    #   plot(data, anomaly=level_shift, anomaly_color='red');
    # except Exception as e:
    #   raise e

    return df


def identify_volatility_shift(df):
    data = validate_series(df['value'])

    # Define a detector for volatility shift
    # Define a detector for step changes
    volatility_shift_ad = VolatilityShiftAD(c=6.0, side='positive', window=30)
    volatility_shift = volatility_shift_ad.fit_detect(data)

    # Handle any index misalignment
    df['volatility_shift'] = volatility_shift.reindex(df.index).fillna(0).astype(int)

    # try:
    #   plot(data, anomaly=volatility_shift, anomaly_color='red');
    # except Exception as e:
    #   raise e

    return df
