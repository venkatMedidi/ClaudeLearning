/**
 * Pre-check run by cs_PixieWebComponent (Pixie eBV button -> initiatePixieCallViaCDC)
 * before CS_eBVProcessor.initiatePixieCall is invoked.
 *
 * Rules:
 *   1. The EP's eBV vendor (from CS_AutoeBVEndpoint__mdt) is Surescripts
 *   2. The BI Case's related Program Case has an Active HIPAA record
 *
 *   1 met,     2 met     -> allow (invoke initiatePixieCall)
 *   1 met,     2 not met -> block, return error toast message
 *   1 not met, 2 any     -> allow (invoke initiatePixieCall)
 *
 * NOTE: fields marked "ASSUMED" must be mapped to your org's actual API names.
 */
public with sharing class CS_eBVHipaaValidator {

    @TestVisible private static final String VENDOR_SURESCRIPTS = 'Surescripts';
    @TestVisible private static final String HIPAA_STATUS_ACTIVE = 'Active';

    // Lets tests stub the vendor, since custom metadata can't be inserted in tests.
    @TestVisible private static String vendorOverride;

    public class ValidationResult {
        @AuraEnabled public Boolean isValid;
        @AuraEnabled public String errorMessage;

        ValidationResult(Boolean isValid, String errorMessage) {
            this.isValid = isValid;
            this.errorMessage = errorMessage;
        }
    }

    @AuraEnabled
    public static ValidationResult validateHipaaForEBV(Id caseId) {
        if (caseId == null) {
            throw new AuraHandledException('BI Case Id is required.');
        }

        // ASSUMED: BI Case -> Program Case via ParentId; EP identified by CS_Program_Name__c.
        Case biCase = [
            SELECT Id, ParentId, CS_Program_Name__c
            FROM Case
            WHERE Id = :caseId
            LIMIT 1
        ];

        // Scenarios 3 & 4: vendor is not Surescripts -> HIPAA is not required.
        if (!isSurescripts(biCase)) {
            return new ValidationResult(true, null);
        }

        // Scenario 1: Surescripts and Active HIPAA on the Program Case -> allow.
        if (biCase.ParentId != null && hasActiveHipaa(biCase.ParentId)) {
            return new ValidationResult(true, null);
        }

        // Scenario 2: Surescripts without Active HIPAA -> block with PBI message.
        return new ValidationResult(false, System.Label.CS_eBV_HIPAA_Not_Active);
    }

    private static Boolean isSurescripts(Case biCase) {
        String vendor = vendorOverride;
        if (vendor == null && String.isNotBlank(biCase.CS_Program_Name__c)) {
            // ASSUMED: CS_Program_Name__c / CS_eBV_Vendor__c fields on CS_AutoeBVEndpoint__mdt.
            for (CS_AutoeBVEndpoint__mdt ep : [
                SELECT CS_eBV_Vendor__c
                FROM CS_AutoeBVEndpoint__mdt
                WHERE CS_Program_Name__c = :biCase.CS_Program_Name__c
                LIMIT 1
            ]) {
                vendor = ep.CS_eBV_Vendor__c;
            }
        }
        return VENDOR_SURESCRIPTS.equalsIgnoreCase(vendor);
    }

    private static Boolean hasActiveHipaa(Id programCaseId) {
        // ASSUMED: CS_HIPAA__c with lookup CS_Program_Case__c and picklist CS_Status__c.
        return ![
            SELECT Id
            FROM CS_HIPAA__c
            WHERE CS_Program_Case__c = :programCaseId
              AND CS_Status__c = :HIPAA_STATUS_ACTIVE
            LIMIT 1
        ].isEmpty();
    }
}
