def evaluate_loan(user, amount):

    score =0

    if user.monthly_income:
        

        if amount <= user.monthly_income * 0.4:
            score +=40


        elif amount <= user.monthly_income * 0.6:
            score += 20


        else:
            score +=30

        if user.employment_status == "Employed":
            score += 20

        score += user.credit_score


        if amount <= user.loan_limit:
            score += 20

        if score >= 100:
            return "approved" 
        elif score >=70:
            return "pending"

        else:
            return "rejected"           

