const TaxDeductionService =
    require("../services/taxDeductionService");

const TaxDeductionController = {

    // create tax deduction
    // post /api/tax-deductions
    async createDeduction(req, res) {

        try {

            const userId =
                req.user.id;

            const deductionData =
                req.body;


            const result =
                await TaxDeductionService
                    .createDeduction(
                        userId,
                        deductionData
                    );


            return res.status(201).json({

                success: true,

                message:
                    "Tax deduction added successfully",

                data: result

            });

        } catch (error) {

            console.error(
                "Create Tax Deduction Error:",
                error
            );


            return res.status(400).json({

                success: false,

                message: error.message

            });
        }
    },


    // get my deductions
    // get /api/tax-deductions
    async getMyDeductions(req, res) {

        try {

            const userId =
                req.user.id;


            const deductions =
                await TaxDeductionService
                    .getMyDeductions(
                        userId
                    );


            return res.status(200).json({

                success: true,

                message:
                    "Tax deductions fetched successfully",

                data: deductions

            });

        } catch (error) {

            console.error(
                "Get Tax Deductions Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Internal server error"

            });
        }
    },


    // get deductions by tax year
    // get /api/tax-deductions/year/:taxyear
    async getMyDeductionsByTaxYear(
        req,
        res
    ) {

        try {

            const userId =
                req.user.id;

            const { taxYear } =
                req.params;


            const deductions =
                await TaxDeductionService
                    .getMyDeductionsByTaxYear(
                        userId,
                        taxYear
                    );


            return res.status(200).json({

                success: true,

                message:
                    "Tax deductions fetched successfully",

                data: deductions

            });

        } catch (error) {

            console.error(
                "Get Tax Deductions By Year Error:",
                error
            );


            return res.status(400).json({

                success: false,

                message: error.message

            });
        }
    },


    // get single deduction
    // get /api/tax-deductions/:id
    async getDeductionById(
        req,
        res
    ) {

        try {

            const userId =
                req.user.id;

            const deductionId =
                Number(req.params.id);


            // validate id
            if (
                !Number.isInteger(
                    deductionId
                ) ||
                deductionId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid deduction ID"

                });
            }


            const deduction =
                await TaxDeductionService
                    .getDeductionById(
                        deductionId,
                        userId
                    );


            return res.status(200).json({

                success: true,

                message:
                    "Tax deduction fetched successfully",

                data: deduction

            });

        } catch (error) {

            console.error(
                "Get Tax Deduction Error:",
                error
            );


            if (
                error.message ===
                "Tax deduction not found."
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        error.message

                });
            }


            if (
                error.message &&
                error.message
                    .toLowerCase()
                    .includes(
                        "not authorized"
                    )
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        error.message

                });
            }


            return res.status(500).json({

                success: false,

                message:
                    "Internal server error"

            });
        }
    },


    // update tax deduction
    // put /api/tax-deductions/:id
    async updateDeduction(
        req,
        res
    ) {

        try {

            const userId =
                req.user.id;

            const deductionId =
                Number(req.params.id);


            // validate id
            if (
                !Number.isInteger(
                    deductionId
                ) ||
                deductionId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid deduction ID"

                });
            }


            const deductionData =
                req.body;


            const updatedDeduction =
                await TaxDeductionService
                    .updateDeduction(
                        deductionId,
                        userId,
                        deductionData
                    );


            return res.status(200).json({

                success: true,

                message:
                    "Tax deduction updated successfully",

                data: updatedDeduction

            });

        } catch (error) {

            console.error(
                "Update Tax Deduction Error:",
                error
            );


            if (
                error.message ===
                "Tax deduction not found."
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        error.message

                });
            }


            if (
                error.message &&
                error.message
                    .toLowerCase()
                    .includes(
                        "not authorized"
                    )
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        error.message

                });
            }


            return res.status(400).json({

                success: false,

                message:
                    error.message

            });
        }
    },


    // delete tax deduction
    // delete /api/tax-deductions/:id
    async deleteDeduction(
        req,
        res
    ) {

        try {

            const userId =
                req.user.id;

            const deductionId =
                Number(req.params.id);


            // validate id
            if (
                !Number.isInteger(
                    deductionId
                ) ||
                deductionId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid deduction ID"

                });
            }


            await TaxDeductionService
                .deleteDeduction(
                    deductionId,
                    userId
                );


            return res.status(200).json({

                success: true,

                message:
                    "Tax deduction deleted successfully"

            });

        } catch (error) {

            console.error(
                "Delete Tax Deduction Error:",
                error
            );


            if (
                error.message ===
                "Tax deduction not found."
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        error.message

                });
            }


            if (
                error.message &&
                error.message
                    .toLowerCase()
                    .includes(
                        "not authorized"
                    )
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        error.message

                });
            }


            return res.status(500).json({

                success: false,

                message:
                    "Internal server error"

            });
        }
    },


    // get total deduction
    // get /api/tax-deductions/total/:taxyear
    async getTotalDeduction(
        req,
        res
    ) {

        try {

            const userId =
                req.user.id;

            const { taxYear } =
                req.params;


            const result =
                await TaxDeductionService
                    .getTotalDeduction(
                        userId,
                        taxYear
                    );


            return res.status(200).json({

                success: true,

                message:
                    "Total deduction calculated successfully",

                data: result

            });

        } catch (error) {

            console.error(
                "Get Total Deduction Error:",
                error
            );


            return res.status(400).json({

                success: false,

                message:
                    error.message

            });
        }
    }

};


module.exports =
    TaxDeductionController;