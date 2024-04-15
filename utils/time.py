import datetime


def get_current_day_epoch():
    current_date = datetime.date.today()
    return int(current_date.strftime("%s"))
