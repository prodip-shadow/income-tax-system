import { useEffect, useState } from "react";

import {
  UserRound,
  CalendarDays,
  Save,
  Pencil,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Car,
  Home,
  Receipt,
  CreditCard,
  Building,
} from "lucide-react";

import toast from "react-hot-toast";

import useAuth from "@/hooks/useAuth";
import TaxpayerProfileService from "@/services/taxpayerProfileService";
import MinimumTaxRuleService from "@/services/minimumTaxRuleService";

const CURRENT_TAX_YEAR = "2026-27";

const STANDARD_AREAS = [
  { area_code: "DHAKA_NORTH", area_name: "Dhaka North City Corporation", minimum_tax_amount: 5000 },
  { area_code: "DHAKA_SOUTH", area_name: "Dhaka South City Corporation", minimum_tax_amount: 5000 },
  { area_code: "CHATTOGRAM", area_name: "Chattogram City Corporation", minimum_tax_amount: 5000 },
  { area_code: "OTHER_CITY", area_name: "Other City Corporations", minimum_tax_amount: 4000 },
  { area_code: "POURASHAVA", area_name: "District Municipalities (Pourashava)", minimum_tax_amount: 3000 },
  { area_code: "OTHER_AREA", area_name: "Other Areas / Rural Regions", minimum_tax_amount: 3000 },
];

const initialFormData = {
  date_of_birth: "",
  gender: "",
  minimum_tax_area: "DHAKA_NORTH",
  is_new_taxpayer: false,
  taxpayer_category: "GENERAL",
  disabled_child_dependents: 0,
  net_wealth: "",
  has_multiple_motor_vehicles: false,
  has_large_house_property: false,
  tds_amount: "",
  advance_tax_amount: "",
};


// these map to the existing boolean fields in the database:
// is_physically_challenged, is_freedom_fighter, is_july_warrior
// plus gender and age (women, senior citizen, third gender)
// the backend determinecategory() uses the same priority.

const TAXPAYER_CATEGORIES = [
  { value: "GENERAL", label: "General" },
  { value: "WOMEN", label: "Women" },
  { value: "SENIOR_CITIZEN", label: "Senior Citizen" },
  { value: "THIRD_GENDER", label: "Third Gender" },
  { value: "PHYSICALLY_CHALLENGED", label: "Physically Challenged" },
  { value: "WAR_WOUNDED_FREEDOM_FIGHTER", label: "Freedom Fighter" },
  { value: "JULY_WARRIOR", label: "July Warrior" },
];


// mirrors the backend determinecategory() priority.

const isFlagActive = (val) => {
  if (val === true || val === "true") return true;
  if (val === false || val === "false") return false;
  return Number(val) === 1;
};

const deriveCategoryFromProfile = (data) => {
  if (!data) return "GENERAL";

  if (isFlagActive(data.is_freedom_fighter)) {
    return "WAR_WOUNDED_FREEDOM_FIGHTER";
  }
  if (isFlagActive(data.is_july_warrior)) {
    return "JULY_WARRIOR";
  }
  if (isFlagActive(data.is_physically_challenged)) {
    return "PHYSICALLY_CHALLENGED";
  }

  const gender = String(data.gender || "").trim().toUpperCase();

  if (
    gender === "THIRD_GENDER" ||
    gender === "THIRD GENDER" ||
    gender === "THIRD"
  ) {
    return "THIRD_GENDER";
  }

  if (
    gender === "FEMALE" ||
    gender === "WOMEN" ||
    gender === "WOMAN"
  ) {
    return "WOMEN";
  }

  // senior citizen requires age >= 65.
  // we check date_of_birth here for display only.
  if (data.date_of_birth) {
    const dob = new Date(data.date_of_birth);
    const today = new Date();
    let age =
      today.getFullYear() - dob.getFullYear();
    const monthDiff =
      today.getMonth() - dob.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 &&
        today.getDate() < dob.getDate())
    ) {
      age--;
    }
    if (age >= 65) {
      return "SENIOR_CITIZEN";
    }
  }

  return "GENERAL";
};


// converts a single dropdown selection back to the
// boolean fields expected by the backend.

const mapCategoryToBooleans = (category) => {
  return {
    is_physically_challenged:
      category === "PHYSICALLY_CHALLENGED",
    is_freedom_fighter:
      category === "WAR_WOUNDED_FREEDOM_FIGHTER",
    is_july_warrior:
      category === "JULY_WARRIOR",
  };
};


const formatCategory = (categoryValue) => {
  const cat = TAXPAYER_CATEGORIES.find(
    (c) => c.value === categoryValue,
  );
  return cat ? cat.label : categoryValue || "General";
};


const YesNo = ({ value }) => {
  return (
    <span
      className={
        value
          ? "text-slate-900"
          : "text-slate-500"
      }
    >
      {value ? "Yes" : "No"}
    </span>
  );
};


const Profile = () => {

  const { user } = useAuth();


  const [profile, setProfile] = useState(null);

  const [formData, setFormData] =
    useState({
      ...initialFormData,
    });

  const [minimumTaxRules, setMinimumTaxRules] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [rulesLoading, setRulesLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [profileExists, setProfileExists] =
    useState(false);


  // fetch profile

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response =
        await TaxpayerProfileService.getProfile();

      const data = response?.data;


      if (!data) {
        setProfile(null);
        setProfileExists(false);
        setEditing(true);

        setFormData({
          ...initialFormData,
        });

        return;
      }


      setProfile(data);
      setProfileExists(true);

      setFormData({
        date_of_birth:
          data.date_of_birth
            ? String(
              data.date_of_birth,
            ).slice(0, 10)
            : "",

        gender:
          data.gender || "",

        minimum_tax_area:
          data.minimum_tax_area || "DHAKA_NORTH",

        is_new_taxpayer:
          Boolean(data.is_new_taxpayer),

        taxpayer_category:
          deriveCategoryFromProfile(data),

        disabled_child_dependents:
          Number(
            data.disabled_child_dependents ||
            0,
          ),

        net_wealth:
          data.net_wealth != null ? String(data.net_wealth) : "",

        has_multiple_motor_vehicles:
          Boolean(data.has_multiple_motor_vehicles),

        has_large_house_property:
          Boolean(data.has_large_house_property),

        tds_amount:
          data.tds_amount != null ? String(data.tds_amount) : "",

        advance_tax_amount:
          data.advance_tax_amount != null ? String(data.advance_tax_amount) : "",
      });

      setEditing(false);
    } catch (error) {

      if (
        error.response?.status === 404
      ) {
        setProfile(null);
        setProfileExists(false);
        setEditing(true);

        setFormData({
          ...initialFormData,
        });

        return;
      }


      console.error(
        "Get Taxpayer Profile Error:",
        error,
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch profile",
      );
    } finally {
      setLoading(false);
    }
  };


  // fetch minimum tax rules

  const fetchMinimumTaxRules = async () => {
    try {
      setRulesLoading(true);

      const response =
        await MinimumTaxRuleService.getRulesByTaxYear(
          "2025-26",
        );

      const apiRules = Array.isArray(response?.data)
        ? response.data
        : [];

      // Combine API area rules with standard areas fallback
      const combined = [...STANDARD_AREAS];
      for (const r of apiRules) {
        if (r.rule_type === "AREA_BASED" || (!r.rule_type && !["REGULAR_TAXPAYER", "NEW_TAXPAYER"].includes(r.area_code))) {
          const idx = combined.findIndex((c) => c.area_code === r.area_code);
          if (idx >= 0) {
            combined[idx] = r;
          } else {
            combined.push(r);
          }
        }
      }

      setMinimumTaxRules(combined);
    } catch (error) {
      console.error(
        "Get Minimum Tax Rules Error:",
        error,
      );

      setMinimumTaxRules(STANDARD_AREAS);
    } finally {
      setRulesLoading(false);
    }
  };


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();

    fetchMinimumTaxRules();
  }, []);


  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previousData) => ({
      ...previousData,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };


  // save profile

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();


    if (!formData.date_of_birth) {
      toast.error(
        "Date of birth is required",
      );

      return;
    }


    if (!formData.gender) {
      toast.error(
        "Gender is required",
      );

      return;
    }


    if (!formData.minimum_tax_area) {
      toast.error(
        "Minimum tax area is required",
      );

      return;
    }


    // check selected area exists in database rules

    const selectedArea =
      minimumTaxRules.find(
        (rule) =>
          rule.area_code ===
          formData.minimum_tax_area,
      );

    if (!selectedArea) {
      toast.error(
        "Please select a valid minimum tax area",
      );

      return;
    }


    const disabledChildDependents =
      Number(
        formData.disabled_child_dependents,
      );

    if (
      !Number.isInteger(
        disabledChildDependents,
      ) ||
      disabledChildDependents < 0
    ) {
      toast.error(
        "Disabled child dependents must be a non-negative integer",
      );

      return;
    }


    const payload = {
      date_of_birth:
        formData.date_of_birth,

      gender:
        formData.gender,

      minimum_tax_area:
        formData.minimum_tax_area || "OTHER_AREA",

      is_new_taxpayer:
        Boolean(formData.is_new_taxpayer),

      ...mapCategoryToBooleans(
        formData.taxpayer_category,
      ),

      disabled_child_dependents:
        disabledChildDependents,

      net_wealth:
        Math.max(0, Number(formData.net_wealth || 0)),

      has_multiple_motor_vehicles:
        Boolean(formData.has_multiple_motor_vehicles),

      has_large_house_property:
        Boolean(formData.has_large_house_property),

      tds_amount:
        Math.max(0, Number(formData.tds_amount || 0)),

      advance_tax_amount:
        Math.max(0, Number(formData.advance_tax_amount || 0)),
    };


    try {
      setSaving(true);


      if (!profileExists) {
        await TaxpayerProfileService.createProfile(
          payload,
        );

        toast.success(
          "Taxpayer profile created successfully",
        );
      }


      else {
        await TaxpayerProfileService.updateProfile(
          payload,
        );

        toast.success(
          "Taxpayer profile updated successfully",
        );
      }


      await fetchProfile();
    } catch (error) {
      console.error(
        "Save Taxpayer Profile Error:",
        error,
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to save profile",
      );
    } finally {
      setSaving(false);
    }
  };


  const handleCancelEdit = () => {
    if (!profile) {
      return;
    }


    setFormData({
      date_of_birth:
        profile.date_of_birth
          ? String(
            profile.date_of_birth,
          ).slice(0, 10)
          : "",

      gender:
        profile.gender || "",

      minimum_tax_area:
        profile.minimum_tax_area || "",

      is_new_taxpayer:
        Boolean(profile.is_new_taxpayer),

      taxpayer_category:
        deriveCategoryFromProfile(profile),

      disabled_child_dependents:
        Number(
          profile.disabled_child_dependents ||
          0,
        ),
    });

    setEditing(false);
  };


  // format gender

  const formatGender = (
    gender,
  ) => {
    if (!gender) {
      return "";
    }

    if (gender === "THIRD_GENDER") {
      return "Third Gender";
    }

    return (
      gender.charAt(0) +
      gender
        .slice(1)
        .toLowerCase()
    );
  };


  // format minimum tax area
  // important:
  // no hardcoded area mapping.
  // area name comes from minimum_tax_rules table.

  const formatArea = (
    areaCode,
  ) => {
    if (!areaCode) {
      return "";
    }

    const rule =
      minimumTaxRules.find(
        (item) =>
          item.area_code ===
          areaCode,
      );

    return (
      rule?.area_name ||
      areaCode
    );
  };


  // get selected area rule

  const selectedArea =
    minimumTaxRules.find(
      (rule) =>
        rule.area_code ===
        formData.minimum_tax_area,
    );


  // loading

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">

        <div className="text-center">

          <RefreshCw className="mx-auto h-5 w-5 animate-spin text-slate-400" />

          <p className="mt-3 text-sm text-slate-500">
            Loading profile...
          </p>

        </div>

      </div>
    );
  }


  // page

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Profile
          </h2>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Manage your personal and
            taxpayer information.
          </p>

        </div>


        {profileExists &&
          !editing && (
            <button
              type="button"
              onClick={() =>
                setEditing(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" />

              Edit Profile
            </button>
          )}

      </div>


      {/* =====================================================
          ACCOUNT INFORMATION
      ====================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">

              <UserRound className="h-4 w-4 text-slate-600" />

            </div>


            <div>

              <h3 className="text-base font-semibold text-slate-900">
                Account Information
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Information from your
                account
              </p>

            </div>

          </div>

        </div>


        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

          {/* FULL NAME */}

          <div>

            <p className="text-xs font-medium text-slate-500">
              Full Name
            </p>

            <p className="mt-1 text-sm font-medium text-slate-900">
              {user?.full_name || ""}
            </p>

          </div>


          {/* EMAIL */}

          <div>

            <p className="text-xs font-medium text-slate-500">
              Email
            </p>

            <p className="mt-1 text-sm font-medium text-slate-900">
              {user?.email || ""}
            </p>

          </div>


          {/* PHONE */}

          <div>

            <p className="text-xs font-medium text-slate-500">
              Phone
            </p>

            <p className="mt-1 text-sm font-medium text-slate-900">
              {user?.phone || ""}
            </p>

          </div>


          {/* NID */}

          <div>

            <p className="text-xs font-medium text-slate-500">
              NID
            </p>

            <p className="mt-1 text-sm font-medium text-slate-900">
              {user?.nid || ""}
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          TAXPAYER INFORMATION
      ====================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* HEADER */}

        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">

          <div className="flex items-center justify-between gap-3">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">

                <ShieldCheck className="h-4 w-4 text-slate-600" />

              </div>


              <div>

                <h3 className="text-base font-semibold text-slate-900">
                  Taxpayer Information
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Information used for
                  tax calculation
                </p>

              </div>

            </div>


            {profileExists &&
              !editing && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">

                  <CheckCircle2 className="h-3.5 w-3.5" />

                  Profile Complete

                </span>
              )}

          </div>

        </div>


        {/* ===================================================
            EDIT MODE
        ==================================================== */}

        {editing ? (

          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6"
          >

            <div className="grid gap-5 md:grid-cols-2">

              {/* =================================================
                  DATE OF BIRTH
              ================================================== */}

              <div>

                <label
                  htmlFor="date_of_birth"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Date of Birth

                  <span className="ml-1 text-red-500">
                    *
                  </span>

                </label>


                <div className="relative">

                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={
                      formData.date_of_birth
                    }
                    onChange={
                      handleChange
                    }
                    max={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    required
                    disabled={saving}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                  />

                </div>

              </div>


              {/* =================================================
                  GENDER
              ================================================== */}

              <div>

                <label
                  htmlFor="gender"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Gender

                  <span className="ml-1 text-red-500">
                    *
                  </span>

                </label>


                <select
                  id="gender"
                  name="gender"
                  value={
                    formData.gender
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={saving}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                >

                  <option value="">
                    Select gender
                  </option>

                  <option value="MALE">
                    Male
                  </option>

                  <option value="FEMALE">
                    Female
                  </option>

                  <option value="THIRD_GENDER">
                    Third Gender
                  </option>

                </select>

              </div>


              {/* =================================================
                  MINIMUM TAX AREA
              ================================================== */}

              <div>

                <label
                  htmlFor="minimum_tax_area"
                  className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700"
                >

                  <MapPin className="h-4 w-4 text-slate-500" />

                  Minimum Tax Area

                  <span className="ml-1 text-red-500">
                    *
                  </span>

                </label>


                <select
                  id="minimum_tax_area"
                  name="minimum_tax_area"
                  value={
                    formData.minimum_tax_area
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={
                    saving ||
                    rulesLoading
                  }
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                >

                  <option value="">
                    {rulesLoading
                      ? "Loading areas..."
                      : "Select minimum tax area"}
                  </option>


                  {minimumTaxRules.map(
                    (rule) => (
                      <option
                        key={rule.id}
                        value={
                          rule.area_code
                        }
                      >
                        {rule.area_name}
                      </option>
                    ),
                  )}

                </select>


                {/* Selected rule information */}

                {selectedArea && (
                  <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">

                    <div className="flex items-center justify-between gap-3">

                      <span className="text-xs text-slate-500">
                        Applicable minimum tax
                      </span>

                      <span className="text-xs font-semibold text-slate-900">
                        BDT{" "}
                        {Number(
                          selectedArea.minimum_tax_amount,
                        ).toLocaleString(
                          "en-BD",
                        )}
                      </span>

                    </div>

                  </div>
                )}

              </div>


              {/* =================================================
                  DISABLED CHILD DEPENDENTS
              ================================================== */}

              <div>

                <label
                  htmlFor="disabled_child_dependents"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Disabled Child
                  Dependents
                </label>


                <input
                  id="disabled_child_dependents"
                  name="disabled_child_dependents"
                  type="number"
                  min="0"
                  step="1"
                  value={
                    formData.disabled_child_dependents
                  }
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                  placeholder="0"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                />

              </div>

            </div>


            {/* =================================================
                TAXPAYER CATEGORY DROPDOWN
            ================================================== */}

            <div className="mt-6">

              <label
                htmlFor="taxpayer_category"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Taxpayer Category

                <span className="ml-1 text-red-500">
                  *
                </span>

              </label>


              <select
                id="taxpayer_category"
                name="taxpayer_category"
                value={
                  formData.taxpayer_category
                }
                onChange={
                  handleChange
                }
                required
                disabled={saving}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
              >

                {TAXPAYER_CATEGORIES.map(
                  (cat) => (
                    <option
                      key={cat.value}
                      value={
                        cat.value
                      }
                    >
                      {cat.label}
                    </option>
                  ),
                )}

              </select>

              <p className="mt-1.5 text-xs text-slate-400">
                Select the taxpayer category
                that applies to you.
              </p>

            </div>


            {/* =================================================
                TAXPAYER FILING STATUS (NEW VS REGULAR)
            ================================================== */}

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_new_taxpayer"
                  checked={Boolean(formData.is_new_taxpayer)}
                  onChange={handleChange}
                  disabled={saving}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <span>New / First-Time Taxpayer</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      Reduced Min Tax: BDT 1,000
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    First-time return filers are eligible for reduced minimum tax of <strong>BDT 1,000</strong>.
                  </p>
                </div>
              </label>
            </div>

            {/* =================================================
                WEALTH SURCHARGE & ASSET TRIGGERS
            ================================================== */}

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Net Wealth &amp; Surcharge Triggers
                  </h3>
                  <p className="text-xs text-slate-500">
                    Used to compute wealth surcharge.
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="net_wealth"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Total Net Wealth / Assets
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">BDT</span>
                  <input
                    id="net_wealth"
                    name="net_wealth"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.net_wealth}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="e.g. 0 or 45000000"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Net wealth exceeding BDT 4 Crore (BDT 40,000,000) attracts a progressive surcharge (10% to 35%).
                </p>
              </div>

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    name="has_multiple_motor_vehicles"
                    checked={Boolean(formData.has_multiple_motor_vehicles)}
                    onChange={handleChange}
                    disabled={saving}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                      <Car className="h-3.5 w-3.5 text-slate-600" />
                      <span>Multiple Motor Vehicles</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Owning &gt;1 motor car/jeep triggers minimum 10% surcharge.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    name="has_large_house_property"
                    checked={Boolean(formData.has_large_house_property)}
                    onChange={handleChange}
                    disabled={saving}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                      <Home className="h-3.5 w-3.5 text-slate-600" />
                      <span>House Property &gt; 8,000 sq ft</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Owning house &gt;8,000 sq ft triggers minimum 10% surcharge.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* =================================================
                TAX CREDITS: TDS & ADVANCE TAX
            ================================================== */}

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Receipt className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Tax Credits (TDS &amp; Advance Tax)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Taxes already prepaid or deducted at source.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="tds_amount"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Tax Deducted at Source (TDS)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">BDT</span>
                    <input
                      id="tds_amount"
                      name="tds_amount"
                      type="number"
                      min="0"
                      step="100"
                      value={formData.tds_amount}
                      onChange={handleChange}
                      disabled={saving}
                      placeholder="0.00"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Deducted from salary, bank profit, or sales.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="advance_tax_amount"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Advance Income Tax Paid
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">BDT</span>
                    <input
                      id="advance_tax_amount"
                      name="advance_tax_amount"
                      type="number"
                      min="0"
                      step="100"
                      value={formData.advance_tax_amount}
                      onChange={handleChange}
                      disabled={saving}
                      placeholder="0.00"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Advance tax paid under Section 153/154.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                ACTION BUTTONS
            ================================================== */}

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

              {profileExists && (
                <button
                  type="button"
                  onClick={
                    handleCancelEdit
                  }
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              )}


              <button
                type="submit"
                disabled={
                  saving ||
                  rulesLoading ||
                  minimumTaxRules.length === 0
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />

                    {profileExists
                      ? "Update Profile"
                      : "Save Profile"}
                  </>
                )}

              </button>

            </div>

          </form>

        ) : (

          // =================================================== view mode

          <div className="p-5 sm:p-6">

            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">

              {/* DATE OF BIRTH */}

              <div>

                <p className="text-xs font-medium text-slate-500">
                  Date of Birth
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">

                  {profile?.date_of_birth
                    ? String(
                      profile.date_of_birth,
                    ).slice(0, 10)
                    : ""}

                </p>

              </div>


              {/* GENDER */}

              <div>

                <p className="text-xs font-medium text-slate-500">
                  Gender
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">

                  {formatGender(
                    profile?.gender,
                  )}

                </p>

              </div>


              {/* MINIMUM TAX AREA */}

              <div>

                <p className="text-xs font-medium text-slate-500">
                  Minimum Tax Area
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">

                  {formatArea(
                    profile?.minimum_tax_area,
                  )}

                </p>

              </div>


              {/* TAXPAYER STATUS (NEW VS REGULAR) */}

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Taxpayer Filing Status
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
                      profile?.is_new_taxpayer
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-slate-100 text-slate-800 border border-slate-200"
                    }`}
                  >
                    {profile?.is_new_taxpayer
                      ? "New / First-Time Taxpayer"
                      : "Regular Taxpayer"}
                  </span>
                </div>
              </div>

              {/* MINIMUM TAX */}

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Applicable Minimum Tax (Current Tax Year)
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    BDT {profile?.is_new_taxpayer ? "1,000" : "5,000"}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({profile?.is_new_taxpayer ? "New Taxpayer Concession" : "Regular Taxpayer Nationwide"})
                  </span>
                </div>
              </div>


              {/* DISABLED CHILD DEPENDENTS */}

              <div>

                <p className="text-xs font-medium text-slate-500">
                  Disabled Child
                  Dependents
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">

                  {Number(
                    profile?.disabled_child_dependents ||
                    0,
                  )}

                </p>

              </div>


              {/* TAXPAYER CATEGORY */}

              <div>

                <p className="text-xs font-medium text-slate-500">
                  Taxpayer Category
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">

                  {formatCategory(
                    deriveCategoryFromProfile(
                      profile,
                    ),
                  )}

                </p>

              </div>

              {/* NET WEALTH */}

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Net Wealth / Assets
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  BDT {Number(profile?.net_wealth || 0).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              {/* SURCHARGE TRIGGERS */}

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Wealth Surcharge Triggers
                </p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 font-medium ${profile?.has_multiple_motor_vehicles ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                    Multi-Vehicles: {profile?.has_multiple_motor_vehicles ? "Yes (>1 Car)" : "No"}
                  </span>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 font-medium ${profile?.has_large_house_property ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                    House &gt; 8,000 sq ft: {profile?.has_large_house_property ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              {/* TDS AMOUNT */}

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Tax Deducted at Source (TDS Credit)
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  BDT {Number(profile?.tds_amount || 0).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              {/* ADVANCE TAX */}

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Advance Tax Paid (Advance Credit)
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  BDT {Number(profile?.advance_tax_amount || 0).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};


export default Profile;