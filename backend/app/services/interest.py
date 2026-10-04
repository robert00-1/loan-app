def calculate_interest(amount: int):
    if amount <= 2000:
        rate = 0.15
    elif amount <= 5000:
        rate =  0.12
    elif amount <= 10000:
        rate = 0.08
    elif amount <= 50000:
        rate = 0.07
    else:
        rate = 0.05

    interest = int(amount * rate)
    total = amount + interest


    return {
        "rate": rate,

        "interest": interest,
        "total": total
    }                


