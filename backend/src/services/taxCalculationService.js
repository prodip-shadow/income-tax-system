const { query, getConnection } = require("../database/query");

const TaxCalculationModel = require("../models/taxCalculationModel");

const TaxCalculationDetailModel = require("../models/taxCalculationDetailModel");

const MinimumTaxRuleModel = require("../models/minimumTaxRuleModel");

const TaxCalculationService = {
  // helper: validate + parse tax year

  parseTaxYear(taxYear) {
    if (typeof taxYear !== "string" || taxYear.trim() === "") {
      throw new Error("Tax year is required");
    }

    const normalizedTaxYear = taxYear.trim();

    if (!/^\d{4}-\d{2}$/.test(normalizedTaxYear)) {
      throw new Error("Invalid tax year format");
    }

    const [startYearString, endYearString] =
      normalizedTaxYear.split("-");

    const startYear = Number(startYearString);

    const expectedEndYear = startYear + 1;

    const expectedEndYearShort = String(expectedEndYear).slice(-2);

    if (endYearString !== expectedEndYearShort) {
      throw new Error("Invalid tax year range");
    }

    return {
      taxYear: normalizedTaxYear,
      startYear,
      endYear: expectedEndYear,
      incomeStartDate: `${startYear}-07-01`,
      incomeEndDate: `${expectedEndYear}-06-30`,
    };
  },

  // helper: round money

  roundMoney(value) {
    const number = Number(value || 0);

    if (!Number.isFinite(number)) {
      return 0;
    }

    return Number(number.toFixed(2));
  },

  // helper: parse date only

  parseDateOnly(value) {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      const date = new Date(
        value.getFullYear(),
        value.getMonth(),
        value.getDate(),
      );

      return Number.isNaN(date.getTime()) ? null : date;
    }

    const dateString = String(value)
      .trim()
      .substring(0, 10);

    const match =
      /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

    if (!match) {
      return null;
    }

    const year = Number(match[1]);

    const month = Number(match[2]) - 1;

    const day = Number(match[3]);

    const date = new Date(year, month, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  },

  // helper: calculate age

  calculateAge(dateOfBirth, taxYearEndDate) {
    const birthDate = this.parseDateOnly(dateOfBirth);

    if (!birthDate) {
      return null;
    }

    let age =
      taxYearEndDate.getFullYear() -
      birthDate.getFullYear();

    const monthDifference =
      taxYearEndDate.getMonth() -
      birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        taxYearEndDate.getDate() < birthDate.getDate()
      )
    ) {
      age--;
    }

    return age;
  },

  // helper: determine taxpayer category

  determineCategory(profile, taxYearEndDate, taxYear = null) {
    const gender = profile.gender
      ? String(profile.gender)
        .trim()
        .toUpperCase()
      : "";

    // war-wounded freedom fighter
    if (Number(profile.is_freedom_fighter) === 1) {
      return "WAR_WOUNDED_FREEDOM_FIGHTER";
    }

    // july warrior (gazetted persons injured in July 2024 uprising, legally enacted from AY 2026-27)
    if (Number(profile.is_july_warrior) === 1) {
      if (!taxYear || taxYear === "2026-27") {
        return "JULY_WARRIOR";
      }
    }

    // physically challenged
    if (
      Number(profile.is_physically_challenged) === 1
    ) {
      return "PHYSICALLY_CHALLENGED";
    }

    // third gender

    if (
      gender === "THIRD_GENDER" ||
      gender === "THIRD GENDER" ||
      gender === "THIRD"
    ) {
      return "THIRD_GENDER";
    }

    // women

    if (
      gender === "FEMALE" ||
      gender === "WOMEN" ||
      gender === "WOMAN"
    ) {
      return "WOMEN";
    }

    // senior citizen

    const age = this.calculateAge(
      profile.date_of_birth,
      taxYearEndDate,
    );

    if (age !== null && age >= 65) {
      return "SENIOR_CITIZEN";
    }

    // general

    return "GENERAL";
  },

  // helper: get minimum tax from database
  async getMinimumTaxRule(taxYear, profile = {}) {
    if (!taxYear) {
      throw new Error("Tax year is required");
    }

    const minimumTaxRule = await MinimumTaxRuleModel.findEffectiveRule(taxYear, profile);

    if (!minimumTaxRule) {
      throw new Error(`Minimum tax rule not found for tax year ${taxYear}`);
    }

    const minimumTax = Number(minimumTaxRule.minimum_tax_amount);

    if (!Number.isFinite(minimumTax) || minimumTax < 0) {
      throw new Error(`Invalid minimum tax amount for tax year ${taxYear}`);
    }

    return {
      id: minimumTaxRule.id,
      ruleType: minimumTaxRule.rule_type,
      areaCode: minimumTaxRule.area_code,
      areaName: minimumTaxRule.area_name,
      amount: this.roundMoney(minimumTax),
    };
  },

  async getMinimumTaxByArea(taxYear, minimumTaxArea) {
    return await this.getMinimumTaxRule(taxYear, { minimum_tax_area: minimumTaxArea });
  },

  // calculate tax

  async calculateTax(userId, taxYear) {
    // 1. basic validation

    if (!userId) {
      throw new Error("User ID is required");
    }

    // 2. tax year

    const {
      taxYear: normalizedTaxYear,
      startYear,
      endYear,
      incomeStartDate,
      incomeEndDate,
    } = this.parseTaxYear(taxYear);

    void startYear;
    void endYear;

    const taxYearEndDate = new Date(
      endYear,
      5,
      30,
    );

    // 3. get taxpayer profile

    const profileRows = await query(
      `
          SELECT
            date_of_birth,
            gender,
            minimum_tax_area,
            is_new_taxpayer,
            is_physically_challenged,
            disabled_child_dependents,
            is_freedom_fighter,
            is_july_warrior,
            net_wealth,
            has_multiple_motor_vehicles,
            has_large_house_property,
            tds_amount,
            advance_tax_amount
          FROM taxpayer_profiles
          WHERE user_id = ?
          LIMIT 1
        `,
      [userId],
    );

    if (
      !profileRows ||
      profileRows.length === 0
    ) {
      throw new Error("Taxpayer profile not found");
    }

    const profile = profileRows[0];

    // 4. determine taxpayer category

    const category = this.determineCategory(
      profile,
      taxYearEndDate,
      normalizedTaxYear,
    );

    // 5. get tax-free threshold

    const thresholdRows = await query(
      `
          SELECT
            tax_free_threshold
          FROM tax_thresholds
          WHERE tax_year = ?
            AND category = ?
            AND status = 'ACTIVE'
            AND effective_from <= ?
            AND (
              effective_to IS NULL
              OR effective_to >= ?
            )
          ORDER BY
            effective_from DESC,
            id DESC
          LIMIT 1
        `,
      [
        normalizedTaxYear,
        category,
        incomeEndDate,
        incomeStartDate,
      ],
    );

    if (
      !thresholdRows ||
      thresholdRows.length === 0
    ) {
      throw new Error(
        `Tax threshold not found for ${category} in ${normalizedTaxYear}`,
      );
    }

    const baseTaxFreeThreshold =
      this.roundMoney(
        thresholdRows[0].tax_free_threshold,
      );

    if (baseTaxFreeThreshold < 0) {
      throw new Error(
        "Invalid tax-free threshold",
      );
    }

    // 6. disabled child dependent benefit

    const rawDisabledChildDependents =
      Number(
        profile.disabled_child_dependents || 0,
      );

    if (
      !Number.isInteger(
        rawDisabledChildDependents,
      ) ||
      rawDisabledChildDependents < 0
    ) {
      throw new Error(
        "Invalid disabled child dependent count",
      );
    }

    const disabledChildDependents =
      rawDisabledChildDependents;

    const disabledChildAdditionalThreshold =
      this.roundMoney(
        disabledChildDependents * 50000,
      );

    const taxFreeThreshold =
      this.roundMoney(
        baseTaxFreeThreshold +
        disabledChildAdditionalThreshold,
      );

    // 7. get total income

    const incomeRows = await query(
      `
          SELECT
            COALESCE(
              SUM(amount),
              0
            ) AS total_income
          FROM income
          WHERE user_id = ?
            AND income_date BETWEEN ?
            AND ?
        `,
      [
        userId,
        incomeStartDate,
        incomeEndDate,
      ],
    );

    const totalIncome = this.roundMoney(
      incomeRows[0]?.total_income,
    );

    if (totalIncome < 0) {
      throw new Error(
        "Invalid total income",
      );
    }

    // 7b. get salary receipts & statutory salary exemption (Section 32 & 6th Schedule Part B)
    // Rule: MIN(EligibleSalaryReceipts / 3, 450,000)

    const salaryRows = await query(
      `
          SELECT
            COALESCE(
              SUM(amount),
              0
            ) AS salary_income
          FROM income
          WHERE user_id = ?
            AND income_type = 'SALARY'
            AND income_date BETWEEN ?
            AND ?
        `,
      [
        userId,
        incomeStartDate,
        incomeEndDate,
      ],
    );

    const salaryIncome = this.roundMoney(
      salaryRows[0]?.salary_income,
    );

    // Statutory salary exemption: database-oriented rule from salary_exemption_rules
    const salaryRuleRows = await query(
      `
        SELECT
          calculation_type,
          exemption_percentage,
          max_exemption_amount
        FROM salary_exemption_rules
        WHERE tax_year = ?
          AND status = 'ACTIVE'
        ORDER BY id DESC
        LIMIT 1
      `,
      [normalizedTaxYear],
    );

    let maxSalaryExemption = ["2025-26", "2026-27"].includes(normalizedTaxYear) ? 500000 : 450000;
    let salaryExemption = 0;

    if (salaryRuleRows.length > 0) {
      const activeSalaryRule = salaryRuleRows[0];
      maxSalaryExemption = Number(activeSalaryRule.max_exemption_amount) || maxSalaryExemption;

      let rawExemption = 0;
      if (activeSalaryRule.calculation_type === "PERCENTAGE") {
        const pct = Number(activeSalaryRule.exemption_percentage) || 33.3333333;
        rawExemption = (salaryIncome * pct) / 100;
      } else {
        // ONE_THIRD (Statutory 1/3 of total salary receipts)
        rawExemption = salaryIncome / 3;
      }

      salaryExemption = this.roundMoney(
        Math.min(rawExemption, maxSalaryExemption),
      );
    } else {
      // Robust statutory fallback if rule is not configured in DB
      salaryExemption = this.roundMoney(
        Math.min(salaryIncome / 3, maxSalaryExemption),
      );
    }

    // 8. get eligible investment (DPS capped per rule, life insurance premium capped at 10% of sum assured)

    const deductionRows = await query(
      `
          SELECT
            COALESCE(
              SUM(
                CASE
                  WHEN
                    tr.calculation_type = 'LIMITED'
                    AND tr.maximum_amount IS NOT NULL
                  THEN
                    LEAST(
                      COALESCE(
                        dt.total_amount,
                        0
                      ),
                      tr.maximum_amount
                    )

                  WHEN
                    tr.calculation_type = 'ACTUAL'
                  THEN
                    COALESCE(
                      dt.total_amount,
                      0
                    )

                  ELSE
                    COALESCE(
                      dt.total_amount,
                      0
                    )
                END
              ),
              0
            ) AS eligible_investment
          FROM
          (
            SELECT
              td.deduction_code,
              SUM(
                CASE
                  WHEN td.deduction_code = 'LIFE_INSURANCE' AND td.policy_sum_assured IS NOT NULL AND td.policy_sum_assured > 0
                  THEN LEAST(td.amount, td.policy_sum_assured * 0.10)
                  ELSE td.amount
                END
              ) AS total_amount
            FROM tax_deductions td
            WHERE td.user_id = ?
              AND td.tax_year = ?
              AND td.deduction_date BETWEEN ?
              AND ?
            GROUP BY
              td.deduction_code
          ) AS dt
          INNER JOIN tax_deduction_rules tr
            ON dt.deduction_code =
               tr.deduction_code
            AND tr.tax_year = ?
          WHERE tr.status = 'ACTIVE'
            AND tr.effective_from <= ?
            AND (
              tr.effective_to IS NULL
              OR tr.effective_to >= ?
            )
        `,
      [
        userId,
        normalizedTaxYear,
        incomeStartDate,
        incomeEndDate,
        normalizedTaxYear,
        incomeEndDate,
        incomeStartDate,
      ],
    );

    const eligibleInvestment =
      this.roundMoney(
        deductionRows[0]?.eligible_investment,
      );

    // 9. get tax-deductible business expense

    const expenseRows = await query(
      `
          SELECT
            COALESCE(
              SUM(amount),
              0
            ) AS total_deductible_expense
          FROM expenses
          WHERE user_id = ?
            AND expense_category = 'BUSINESS'
            AND is_tax_deductible = 1
            AND expense_date BETWEEN ?
            AND ?
        `,
      [
        userId,
        incomeStartDate,
        incomeEndDate,
      ],
    );

    const totalDeductibleExpense =
      this.roundMoney(
        expenseRows[0]
          ?.total_deductible_expense,
      );

    // Total statutory deduction: salary exemption + tax-deductible business expenses
    // NOTE: Investment instruments (DPS, Life Insurance, Securities, Stocks, etc.) DO NOT reduce gross or taxable income;
    // they are solely for the Section 78 investment tax rebate.
    const totalDeduction =
      this.roundMoney(
        salaryExemption + totalDeductibleExpense,
      );

    // 10. calculate taxable income

    const taxableIncome =
      this.roundMoney(
        Math.max(
          totalIncome - totalDeduction,
          0,
        ),
      );

    // 11. get active tax rules

    const taxRules = await query(
      `
          SELECT
            id,
            minimum_income,
            maximum_income,
            tax_rate,
            fixed_amount
          FROM tax_rules
          WHERE tax_year = ?
            AND status = 'ACTIVE'
            AND effective_from <= ?
            AND (
              effective_to IS NULL
              OR effective_to >= ?
            )
          ORDER BY
            minimum_income ASC,
            id ASC
        `,
      [
        normalizedTaxYear,
        incomeEndDate,
        incomeStartDate,
      ],
    );

    if (
      !taxRules ||
      taxRules.length === 0
    ) {
      throw new Error(
        `No active tax rules found for ${normalizedTaxYear}`,
      );
    }

    // 12. validate tax rules

    let previousMaximum = null;

    for (const rule of taxRules) {
      const minimumIncome = Number(
        rule.minimum_income,
      );

      const maximumIncome =
        rule.maximum_income === null ||
          rule.maximum_income === undefined
          ? null
          : Number(rule.maximum_income);

      const taxRate = Number(
        rule.tax_rate || 0,
      );

      const fixedAmount = Number(
        rule.fixed_amount || 0,
      );

      if (
        !Number.isFinite(
          minimumIncome,
        ) ||
        minimumIncome < 0
      ) {
        throw new Error(
          `Invalid minimum income in tax rule ${rule.id}`,
        );
      }

      if (
        maximumIncome !== null &&
        (
          !Number.isFinite(
            maximumIncome,
          ) ||
          maximumIncome <= minimumIncome
        )
      ) {
        throw new Error(
          `Invalid maximum income in tax rule ${rule.id}`,
        );
      }

      if (
        !Number.isFinite(taxRate) ||
        taxRate < 0 ||
        taxRate > 100
      ) {
        throw new Error(
          `Invalid tax rate in tax rule ${rule.id}`,
        );
      }

      if (
        !Number.isFinite(fixedAmount) ||
        fixedAmount < 0
      ) {
        throw new Error(
          `Invalid fixed amount in tax rule ${rule.id}`,
        );
      }

      if (
        previousMaximum !== null &&
        minimumIncome < previousMaximum
      ) {
        throw new Error(
          `Tax rules overlap around income ${minimumIncome}`,
        );
      }

      if (maximumIncome !== null) {
        previousMaximum =
          maximumIncome;
      } else {
        previousMaximum =
          Infinity;
      }
    }

    // 13. progressive tax calculation (NBR sequential intervals)

    let grossTax = 0;

    const details = [];

    // Zero-rate slab representing the individual's tax-free threshold
    const zeroRule = taxRules.find((rule) => Number(rule.tax_rate || 0) === 0);
    const zeroTaxableAmount = this.roundMoney(Math.min(taxableIncome, taxFreeThreshold));
    details.push({
      taxRuleId: zeroRule ? zeroRule.id : null,
      slabOrder: 1,
      minimumIncome: 0,
      maximumIncome: taxFreeThreshold,
      taxRate: 0,
      taxableAmount: zeroTaxableAmount,
      calculatedTax: 0,
    });

    if (taxableIncome > taxFreeThreshold) {
      let currentPointer = taxFreeThreshold;

      for (const rule of taxRules) {
        const taxRate = Number(rule.tax_rate || 0);

        // Skip 0% rules (already handled in base slab)
        if (taxRate <= 0) {
          continue;
        }

        if (taxableIncome <= currentPointer) {
          break;
        }

        const minIncome = Number(rule.minimum_income || 0);
        const maxIncome =
          rule.maximum_income === null || rule.maximum_income === undefined
            ? null
            : Number(rule.maximum_income);

        // Each progressive slab interval span (পরবর্তী ধাপসমূহ)
        const slabSpan =
          maxIncome !== null ? Math.max(0, maxIncome - minIncome) : null;
        const slabStart = currentPointer;
        const slabEnd =
          slabSpan !== null ? currentPointer + slabSpan : null;

        const taxableAmount =
          slabEnd !== null
            ? this.roundMoney(Math.min(taxableIncome, slabEnd) - slabStart)
            : this.roundMoney(taxableIncome - slabStart);

        if (taxableAmount <= 0) {
          continue;
        }

        const calculatedTax = this.roundMoney(
          taxableAmount * (taxRate / 100),
        );

        grossTax = this.roundMoney(grossTax + calculatedTax);

        details.push({
          taxRuleId: rule.id,
          slabOrder: details.length + 1,
          minimumIncome: slabStart,
          maximumIncome: slabEnd,
          taxRate,
          taxableAmount,
          calculatedTax,
        });

        currentPointer = slabEnd !== null ? slabEnd : taxableIncome;

        if (taxableIncome <= currentPointer) {
          break;
        }
      }
    }

    grossTax =
      this.roundMoney(
        grossTax,
      );

    // 14. get active tax rebate rules

    const rebateRuleRows =
      await query(
        `
          SELECT
            id,
            rule_code,
            rule_name,
            calculation_type,
            basis_type,
            rate,
            fixed_amount
          FROM tax_rebate_rules
          WHERE tax_year = ?
            AND status = 'ACTIVE'
            AND effective_from <= ?
            AND (
              effective_to IS NULL
              OR effective_to >= ?
            )
          ORDER BY
            id ASC
        `,
        [
          normalizedTaxYear,
          incomeEndDate,
          incomeStartDate,
        ],
      );

    if (
      !rebateRuleRows ||
      rebateRuleRows.length === 0
    ) {
      throw new Error(
        `No active tax rebate rules found for ${normalizedTaxYear}`,
      );
    }

    // 15. validate rebate rules

    const rebateRules = {};

    for (
      const rule of rebateRuleRows
    ) {
      const ruleCode =
        String(
          rule.rule_code || "",
        )
          .trim()
          .toUpperCase();

      if (!ruleCode) {
        throw new Error(
          `Invalid tax rebate rule code in rule ${rule.id}`,
        );
      }

      const calculationType =
        String(
          rule.calculation_type ||
          "",
        )
          .trim()
          .toUpperCase();

      const basisType =
        String(
          rule.basis_type || "",
        )
          .trim()
          .toUpperCase();

      const rate =
        rule.rate === null ||
          rule.rate === undefined
          ? null
          : Number(rule.rate);

      const fixedAmount =
        rule.fixed_amount === null ||
          rule.fixed_amount === undefined
          ? null
          : Number(
            rule.fixed_amount,
          );

      if (
        ![
          "PERCENTAGE",
          "FIXED",
          "LIMIT",
        ].includes(
          calculationType,
        )
      ) {
        throw new Error(
          `Invalid rebate calculation type in rule ${rule.id}: ${calculationType}`,
        );
      }

      if (
        rate !== null &&
        (
          !Number.isFinite(
            rate,
          ) ||
          rate < 0 ||
          rate > 100
        )
      ) {
        throw new Error(
          `Invalid rebate rate in rule ${rule.id}`,
        );
      }

      if (
        fixedAmount !== null &&
        (
          !Number.isFinite(
            fixedAmount,
          ) ||
          fixedAmount < 0
        )
      ) {
        throw new Error(
          `Invalid fixed amount in rebate rule ${rule.id}`,
        );
      }

      if (
        rebateRules[ruleCode]
      ) {
        throw new Error(
          `Duplicate active tax rebate rule: ${ruleCode}`,
        );
      }

      rebateRules[ruleCode] = {
        id: rule.id,

        ruleCode,

        ruleName:
          rule.rule_name,

        calculationType,

        basisType,

        rate,

        fixedAmount,
      };
    }

    // 16. required rebate rules

    const investmentIncomeRule =
      rebateRules
        .INVESTMENT_INCOME_LIMIT;

    const investmentAbsoluteRule =
      rebateRules
        .INVESTMENT_ABSOLUTE_LIMIT;

    const rebateRateRule =
      rebateRules
        .REBATE_RATE;

    if (
      !investmentIncomeRule
    ) {
      throw new Error(
        `Tax rebate rule INVESTMENT_INCOME_LIMIT not found for ${normalizedTaxYear}`,
      );
    }

    if (
      !investmentAbsoluteRule
    ) {
      throw new Error(
        `Tax rebate rule INVESTMENT_ABSOLUTE_LIMIT not found for ${normalizedTaxYear}`,
      );
    }

    if (
      !rebateRateRule
    ) {
      throw new Error(
        `Tax rebate rule REBATE_RATE not found for ${normalizedTaxYear}`,
      );
    }

    // 17. validate required rebate configuration

    if (
      investmentIncomeRule.calculationType !==
      "PERCENTAGE" ||
      investmentIncomeRule.basisType !==
      "TAXABLE_INCOME" ||
      investmentIncomeRule.rate ===
      null
    ) {
      throw new Error(
        "Invalid INVESTMENT_INCOME_LIMIT rebate rule configuration",
      );
    }

    if (
      investmentAbsoluteRule.calculationType !==
      "LIMIT" ||
      investmentAbsoluteRule.basisType !==
      "CONSTANT" ||
      investmentAbsoluteRule.fixedAmount ===
      null
    ) {
      throw new Error(
        "Invalid INVESTMENT_ABSOLUTE_LIMIT rebate rule configuration",
      );
    }

    if (
      rebateRateRule.calculationType !==
      "PERCENTAGE" ||
      rebateRateRule.basisType !==
      "ALLOWABLE_INVESTMENT" ||
      rebateRateRule.rate ===
      null
    ) {
      throw new Error(
        "Invalid REBATE_RATE rebate rule configuration",
      );
    }

    // 18. calculate investment rebate limits

    const incomeBasedRebateLimit =
      this.roundMoney(
        taxableIncome *
        (
          investmentIncomeRule.rate /
          100
        ),
      );

    const investmentBasedRebateLimit =
      this.roundMoney(
        eligibleInvestment *
        (
          rebateRateRule.rate /
          100
        ),
      );

    const absoluteLimit =
      this.roundMoney(
        investmentAbsoluteRule.fixedAmount,
      );

    const investmentMaximum = absoluteLimit;
    const investmentLimitByIncome = incomeBasedRebateLimit;
    const rebateRate = rebateRateRule.rate / 100;

    // allowable investment preserved for backward compatibility
    const allowableInvestment =
      this.roundMoney(
        Math.min(
          eligibleInvestment,
          investmentMaximum,
        ),
      );

    // 19. investment tax rebate

    const calculatedRebate =
      this.roundMoney(
        Math.min(
          incomeBasedRebateLimit,
          investmentBasedRebateLimit,
          absoluteLimit,
        ),
      );

    const taxRebate =
      this.roundMoney(
        Math.min(
          calculatedRebate,
          grossTax,
        ),
      );

    // 21. tax after rebate (regular net tax)

    const taxAfterRebate =
      this.roundMoney(
        Math.max(
          grossTax -
          taxRebate,
          0,
        ),
      );

    const netTax = taxAfterRebate;

    // 22. get minimum tax from database

    const minimumTaxRule =
      await this.getMinimumTaxRule(
        normalizedTaxYear,
        profile,
      );

    const minimumTax =
      minimumTaxRule.amount;

    const minimumTaxArea =
      minimumTaxRule.areaCode;

    const minimumTaxAreaName =
      minimumTaxRule.areaName;

    // 23. apply minimum tax

    const minimumTaxApplicable =
      totalIncome >
      taxFreeThreshold;

    const minimumTaxApplied =
      minimumTaxApplicable &&
      taxAfterRebate <
      minimumTax;

    const taxLiability =
      this.roundMoney(
        minimumTaxApplicable
          ? Math.max(
            taxAfterRebate,
            minimumTax,
          )
          : 0,
      );

    // 23b. calculate wealth surcharge (Income Tax Act 2023, Section 73 & Finance Acts)

    const netWealth = this.roundMoney(profile.net_wealth || 0);
    const hasMultipleMotorVehicles = Number(profile.has_multiple_motor_vehicles || 0) === 1;
    const hasLargeHouseProperty = Number(profile.has_large_house_property || 0) === 1;

    // fetch wealth surcharge rules for the tax year
    const surchargeRuleRows = await query(
      `
        SELECT
          id,
          rule_name,
          minimum_wealth,
          maximum_wealth,
          surcharge_rate
        FROM surcharge_rules
        WHERE tax_year = ?
          AND status = 'ACTIVE'
          AND ? >= minimum_wealth
          AND (? <= maximum_wealth OR maximum_wealth IS NULL)
        ORDER BY minimum_wealth DESC
        LIMIT 1
      `,
      [normalizedTaxYear, netWealth, netWealth],
    );

    let bracketSurchargeRate = 0;
    if (surchargeRuleRows && surchargeRuleRows.length > 0) {
      bracketSurchargeRate = Number(surchargeRuleRows[0].surcharge_rate || 0);
    }

    let surchargeRate = bracketSurchargeRate;
    let surchargeTriggerApplied = false;

    // Special triggers: multiple motor vehicles OR City Corp residential property > 8,000 sq ft
    // triggers minimum 10% surcharge
    if (hasMultipleMotorVehicles || hasLargeHouseProperty) {
      if (surchargeRate < 10) {
        surchargeRate = 10;
        surchargeTriggerApplied = true;
      }
    }

    // Statutory surcharge base is regular tax liability
    const surchargeBase = taxLiability;
    const surchargeAmount = this.roundMoney(
      surchargeBase * (surchargeRate / 100),
    );

    const totalTaxPayable = this.roundMoney(
      taxLiability + surchargeAmount,
    );

    // 23c. apply tax credits (TDS and Advance Tax)
    const tdsAmount = this.roundMoney(profile.tds_amount || 0);
    const advanceTaxAmount = this.roundMoney(profile.advance_tax_amount || 0);
    const totalTaxCredits = this.roundMoney(tdsAmount + advanceTaxAmount);

    const finalPayable = this.roundMoney(
      totalTaxPayable - totalTaxCredits,
    );

    // 24. create tax calculation + details

    const connection =
      await getConnection();

    let calculationId;

    try {
      await connection.beginTransaction();

      // insert tax calculation with full audit trail

      const [calculationResult] =
        await connection.execute(
          `
            INSERT INTO tax_calculations (
              user_id,
              tax_year,
              category,
              total_income,
              total_deduction,
              taxable_income,
              eligible_investment,
              gross_tax,
              tax_rebate,
              tax_liability,
              salary_income,
              salary_exemption,
              net_tax,
              minimum_tax,
              net_wealth,
              surcharge_rate,
              surcharge_amount,
              total_tax_payable,
              tds_amount,
              advance_tax_amount,
              final_payable
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            userId,
            normalizedTaxYear,
            category,
            totalIncome,
            totalDeduction,
            taxableIncome,
            eligibleInvestment,
            grossTax,
            taxRebate,
            taxLiability,
            salaryIncome,
            salaryExemption,
            netTax,
            minimumTax,
            netWealth,
            surchargeRate,
            surchargeAmount,
            totalTaxPayable,
            tdsAmount,
            advanceTaxAmount,
            finalPayable,
          ],
        );

      calculationId =
        calculationResult.insertId;

      if (!calculationId) {
        throw new Error(
          "Failed to create tax calculation",
        );
      }

      // insert tax calculation details

      for (
        const detail of details
      ) {
        await connection.execute(
          `
            INSERT INTO tax_calculation_details (
              tax_calculation_id,
              tax_rule_id,
              slab_order,
              minimum_income,
              maximum_income,
              tax_rate,
              taxable_amount,
              calculated_tax
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            calculationId,
            detail.taxRuleId,
            detail.slabOrder,
            detail.minimumIncome,
            detail.maximumIncome,
            detail.taxRate,
            detail.taxableAmount,
            detail.calculatedTax,
          ],
        );
      }

      await connection.commit();
    } catch (error) {
      try {
        await connection.rollback();
      } catch (
      rollbackError
      ) {
        console.error(
          "Tax calculation rollback error:",
          rollbackError,
        );
      }

      throw error;
    } finally {
      connection.release();
    }

    // 25. return result

    return {
      id: calculationId,
      calculationId,

      userId,

      taxYear:
        normalizedTaxYear,

      category,

      totalIncome,
      total_income: totalIncome,

      salaryIncome,
      salary_income: salaryIncome,

      salaryExemption,
      salary_exemption: salaryExemption,

      totalDeductibleExpense,
      total_deductible_expense: totalDeductibleExpense,

      totalDeduction,
      total_deduction: totalDeduction,

      taxableIncome,
      taxable_income: taxableIncome,

      disabledChildDependents,

      disabledChildAdditionalThreshold,

      taxFreeThreshold,
      tax_free_threshold: taxFreeThreshold,

      eligibleInvestment,
      eligible_investment: eligibleInvestment,

      incomeBasedRebateLimit,
      income_based_rebate_limit: incomeBasedRebateLimit,

      investmentBasedRebateLimit,
      investment_based_rebate_limit: investmentBasedRebateLimit,

      calculatedRebate,
      calculated_rebate: calculatedRebate,

      allowableInvestment,
      allowable_investment: allowableInvestment,

      investmentLimitByIncome,
      investment_limit_by_income: investmentLimitByIncome,

      investmentMaximum,
      investment_maximum: investmentMaximum,

      grossTax,
      gross_tax: grossTax,

      taxRebate,
      tax_rebate: taxRebate,

      rebateRate: rebateRateRule.rate,
      rebate_rate: rebateRateRule.rate,

      rebateRuleId: rebateRateRule.id,
      rebateRuleCode: rebateRateRule.ruleCode,

      netTax,
      net_tax: netTax,

      taxAfterRebate,
      tax_after_rebate: taxAfterRebate,

      minimumTax,
      minimum_tax: minimumTax,

      minimumTaxArea,
      minimum_tax_area: minimumTaxArea,

      minimumTaxAreaName,
      minimum_tax_area_name: minimumTaxAreaName,

      minimumTaxRuleType: minimumTaxRule.ruleType,
      minimum_tax_rule_type: minimumTaxRule.ruleType,

      isNewTaxpayer: Number(profile.is_new_taxpayer || 0) === 1,
      is_new_taxpayer: Number(profile.is_new_taxpayer || 0),

      minimumTaxApplicable,
      minimum_tax_applicable: minimumTaxApplicable,

      minimumTaxApplied,
      minimum_tax_applied: minimumTaxApplied,

      taxLiability,
      tax_liability: taxLiability,

      netWealth,
      net_wealth: netWealth,

      hasMultipleMotorVehicles,
      has_multiple_motor_vehicles: hasMultipleMotorVehicles ? 1 : 0,

      hasLargeHouseProperty,
      has_large_house_property: hasLargeHouseProperty ? 1 : 0,

      surchargeRate,
      surcharge_rate: surchargeRate,

      surchargeAmount,
      surcharge_amount: surchargeAmount,

      surchargeTriggerApplied,
      surcharge_trigger_applied: surchargeTriggerApplied,

      totalTaxPayable,
      total_tax_payable: totalTaxPayable,

      tdsAmount,
      tds_amount: tdsAmount,

      advanceTaxAmount,
      advance_tax_amount: advanceTaxAmount,

      totalTaxCredits,
      total_tax_credits: totalTaxCredits,

      finalPayable,
      final_payable: finalPayable,

      details,
    };
  },

  // helper: enrich calculation record with derived metrics

  async enrichCalculation(calculation, details = null) {
    if (!calculation) {
      return null;
    }

    const userId = calculation.user_id || calculation.userId;
    const taxYear = calculation.tax_year || calculation.taxYear;
    const category = calculation.category || "GENERAL";
    const totalIncome = Number(calculation.total_income ?? calculation.totalIncome ?? 0);
    const totalDeduction = Number(calculation.total_deduction ?? calculation.totalDeduction ?? 0);
    const taxableIncome = Number(calculation.taxable_income ?? calculation.taxableIncome ?? 0);
    const eligibleInvestment = Number(calculation.eligible_investment ?? calculation.eligibleInvestment ?? 0);
    const grossTax = Number(calculation.gross_tax ?? calculation.grossTax ?? 0);
    let taxRebate = Number(calculation.tax_rebate ?? calculation.taxRebate ?? 0);
    let taxLiability = Number(calculation.tax_liability ?? calculation.taxLiability ?? 0);

    let disabledChildDependents = 0;
    let disabledChildAdditionalThreshold = 0;
    let minimumTaxArea = null;
    let isNewTaxpayer = 0;
    let userProfile = {};

    if (userId) {
      const profileRows = await query(
        `SELECT minimum_tax_area, is_new_taxpayer, disabled_child_dependents, net_wealth, has_multiple_motor_vehicles, has_large_house_property, tds_amount, advance_tax_amount FROM taxpayer_profiles WHERE user_id = ? LIMIT 1`,
        [userId]
      );
      if (profileRows && profileRows.length > 0) {
        userProfile = profileRows[0];
        minimumTaxArea = profileRows[0].minimum_tax_area || null;
        isNewTaxpayer = Number(profileRows[0].is_new_taxpayer || 0);
        disabledChildDependents = Number(profileRows[0].disabled_child_dependents || 0);
        disabledChildAdditionalThreshold = this.roundMoney(disabledChildDependents * 50000);
      }
    }

    let baseTaxFreeThreshold = 0;
    if (taxYear && category) {
      const thresholdRows = await query(
        `SELECT tax_free_threshold FROM tax_thresholds WHERE tax_year = ? AND category = ? AND status = 'ACTIVE' LIMIT 1`,
        [taxYear, category]
      );
      if (thresholdRows && thresholdRows.length > 0) {
        baseTaxFreeThreshold = this.roundMoney(thresholdRows[0].tax_free_threshold);
      }
    }
    const taxFreeThreshold = this.roundMoney(baseTaxFreeThreshold + disabledChildAdditionalThreshold);

    let investmentLimitByIncome = 0;
    let investmentMaximum = 0;
    let rebateRate = 0;
    let allowableInvestment = 0;
    let incomeBasedRebateLimit = 0;
    let investmentBasedRebateLimit = 0;
    let calculatedRebate = 0;

    if (taxYear) {
      const rebateRules = await query(
        `
          SELECT rule_code, calculation_type, basis_type, rate, fixed_amount
          FROM tax_rebate_rules
          WHERE tax_year = ? AND status = 'ACTIVE'
        `,
        [taxYear]
      );

      const rulesMap = {};
      (rebateRules || []).forEach((rule) => {
        rulesMap[rule.rule_code] = rule;
      });

      const incomeRule = rulesMap.INVESTMENT_INCOME_LIMIT;
      const maxRule = rulesMap.INVESTMENT_ABSOLUTE_LIMIT;
      const rateRule = rulesMap.REBATE_RATE;

      if (incomeRule && incomeRule.rate !== null && incomeRule.rate !== undefined) {
        incomeBasedRebateLimit = this.roundMoney(taxableIncome * (Number(incomeRule.rate) / 100));
        investmentLimitByIncome = incomeBasedRebateLimit;
      }

      if (maxRule && maxRule.fixed_amount !== null && maxRule.fixed_amount !== undefined) {
        investmentMaximum = this.roundMoney(Number(maxRule.fixed_amount));
      }

      if (rateRule && rateRule.rate !== null && rateRule.rate !== undefined) {
        rebateRate = Number(rateRule.rate);
        investmentBasedRebateLimit = this.roundMoney(eligibleInvestment * (rebateRate / 100));
      }

      allowableInvestment = this.roundMoney(
        Math.min(eligibleInvestment, investmentMaximum)
      );

      if (incomeRule && maxRule && rateRule) {
        calculatedRebate = this.roundMoney(
          Math.min(incomeBasedRebateLimit, investmentBasedRebateLimit, investmentMaximum)
        );
        taxRebate = this.roundMoney(Math.min(calculatedRebate, grossTax));
      }
    }

    const taxAfterRebate = this.roundMoney(Math.max(0, grossTax - taxRebate));

    let minimumTax = 0;
    let minimumTaxAreaCode = minimumTaxArea || "N/A";
    let minimumTaxAreaName = "N/A";
    let minimumTaxRuleType = "AREA_BASED";
    let minimumTaxApplicable = false;
    let minimumTaxApplied = false;

    if (taxYear) {
      const minRule = await MinimumTaxRuleModel.findEffectiveRule(taxYear, userProfile);
      if (minRule) {
        minimumTax = this.roundMoney(minRule.minimum_tax_amount);
        minimumTaxAreaCode = minRule.area_code;
        minimumTaxAreaName = minRule.area_name;
        minimumTaxRuleType = minRule.rule_type;
        minimumTaxApplicable = totalIncome > taxFreeThreshold;
        minimumTaxApplied = minimumTaxApplicable && (taxAfterRebate < minimumTax);
      }
    }

    taxLiability = this.roundMoney(minimumTaxApplicable ? Math.max(taxAfterRebate, minimumTax) : 0);

    const salaryIncome = Number(calculation.salary_income ?? calculation.salaryIncome ?? 0);
    const salaryExemption = Number(calculation.salary_exemption ?? calculation.salaryExemption ?? 0);
    const totalDeductibleExpense = Number(
      calculation.total_deductible_expense ??
      calculation.totalDeductibleExpense ??
      Math.max(0, totalDeduction - salaryExemption)
    );
    const netTax = Number(calculation.net_tax ?? calculation.netTax ?? taxAfterRebate);
    const netWealth = Number(calculation.net_wealth ?? calculation.netWealth ?? userProfile.net_wealth ?? 0);
    const hasMultipleMotorVehicles = Number(calculation.has_multiple_motor_vehicles ?? calculation.hasMultipleMotorVehicles ?? userProfile.has_multiple_motor_vehicles ?? 0);
    const hasLargeHouseProperty = Number(calculation.has_large_house_property ?? calculation.hasLargeHouseProperty ?? userProfile.has_large_house_property ?? 0);
    const surchargeRate = Number(calculation.surcharge_rate ?? calculation.surchargeRate ?? 0);
    const surchargeAmount = Number(calculation.surcharge_amount ?? calculation.surchargeAmount ?? this.roundMoney(taxLiability * (surchargeRate / 100)));
    const totalTaxPayable = Number(calculation.total_tax_payable ?? calculation.totalTaxPayable ?? this.roundMoney(taxLiability + surchargeAmount));
    const tdsAmount = Number(calculation.tds_amount ?? calculation.tdsAmount ?? userProfile.tds_amount ?? 0);
    const advanceTaxAmount = Number(calculation.advance_tax_amount ?? calculation.advanceTaxAmount ?? userProfile.advance_tax_amount ?? 0);
    const totalTaxCredits = this.roundMoney(tdsAmount + advanceTaxAmount);
    const finalPayable = Number(calculation.final_payable ?? calculation.finalPayable ?? this.roundMoney(totalTaxPayable - totalTaxCredits));

    return {
      ...calculation,
      taxYear,
      category,
      totalIncome,
      totalDeduction,
      taxableIncome,
      eligibleInvestment,
      grossTax,
      calculatedRebate,
      taxRebate,
      taxLiability,

      salaryIncome,
      salaryExemption,
      totalDeductibleExpense,
      total_deductible_expense: totalDeductibleExpense,
      netTax,
      netWealth,
      hasMultipleMotorVehicles: hasMultipleMotorVehicles === 1,
      hasLargeHouseProperty: hasLargeHouseProperty === 1,
      surchargeRate,
      surchargeAmount,
      totalTaxPayable,
      tdsAmount,
      advanceTaxAmount,
      totalTaxCredits,
      finalPayable,

      disabledChildDependents,
      disabledChildAdditionalThreshold,
      taxFreeThreshold,

      incomeBasedRebateLimit,
      investmentBasedRebateLimit,
      allowableInvestment,
      investmentLimitByIncome,
      investmentMaximum,
      rebateRate,
      taxAfterRebate,

      minimumTaxArea: minimumTaxAreaCode,
      minimumTaxAreaName,
      minimumTaxRuleType,
      minimumTax,
      minimumTaxApplicable,
      minimumTaxApplied,
      isNewTaxpayer: isNewTaxpayer === 1,

      // snake_case aliases for api backwards compatibility
      salary_income: salaryIncome,
      salary_exemption: salaryExemption,
      net_tax: netTax,
      net_wealth: netWealth,
      has_multiple_motor_vehicles: hasMultipleMotorVehicles,
      has_large_house_property: hasLargeHouseProperty,
      surcharge_rate: surchargeRate,
      surcharge_amount: surchargeAmount,
      total_tax_payable: totalTaxPayable,
      tds_amount: tdsAmount,
      advance_tax_amount: advanceTaxAmount,
      total_tax_credits: totalTaxCredits,
      final_payable: finalPayable,

      disabled_child_dependents: disabledChildDependents,
      disabled_child_additional_threshold: disabledChildAdditionalThreshold,
      tax_free_threshold: taxFreeThreshold,
      income_based_rebate_limit: incomeBasedRebateLimit,
      investment_based_rebate_limit: investmentBasedRebateLimit,
      calculated_rebate: calculatedRebate,
      tax_rebate: taxRebate,
      tax_liability: taxLiability,
      allowable_investment: allowableInvestment,
      investment_limit_by_income: investmentLimitByIncome,
      investment_maximum: investmentMaximum,
      rebate_rate: rebateRate,
      tax_after_rebate: taxAfterRebate,
      minimum_tax_area: minimumTaxAreaCode,
      minimum_tax_area_name: minimumTaxAreaName,
      minimum_tax_rule_type: minimumTaxRuleType,
      minimum_tax: minimumTax,
      minimum_tax_applicable: minimumTaxApplicable,
      minimum_tax_applied: minimumTaxApplied,
      is_new_taxpayer: isNewTaxpayer,

      ...(details ? { details } : {}),
    };
  },

  async enrichCalculations(calculations) {
    if (!Array.isArray(calculations)) return [];
    return await Promise.all(
      calculations.map((calc) => this.enrichCalculation(calc))
    );
  },

  // get all tax calculations

  async getCalculations(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const calculations = await TaxCalculationModel.getCalculationsByUserId(userId);
    return await this.enrichCalculations(calculations);
  },

  // get single tax calculation with details

  async getCalculationById(id, userId) {
    if (!id) {
      throw new Error("Calculation ID is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    const calculation = await TaxCalculationModel.getCalculationById(id, userId);
    if (!calculation) {
      return null;
    }

    const details = await TaxCalculationDetailModel.getDetailsByCalculationId(id);
    return await this.enrichCalculation(calculation, details);
  },

  // delete tax calculation
  async deleteCalculation(id, userId) {
    if (!id) {
      throw new Error("Calculation ID is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    const calculation = await TaxCalculationModel.getCalculationById(id, userId);
    if (!calculation) {
      return false;
    }

    await TaxCalculationModel.deleteCalculation(id, userId);
    return true;
  },
};

// export

module.exports = TaxCalculationService;