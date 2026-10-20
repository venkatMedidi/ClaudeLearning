@IsTest
private class CS_eBVHipaaValidatorTest {

    private static Case createBiCase(Boolean withActiveHipaa) {
        Case programCase = new Case(Subject = 'Program Case');
        insert programCase;

        if (withActiveHipaa) {
            insert new CS_HIPAA__c(
                CS_Program_Case__c = programCase.Id,
                CS_Status__c = CS_eBVHipaaValidator.HIPAA_STATUS_ACTIVE
            );
        }

        Case biCase = new Case(Subject = 'BI Case', ParentId = programCase.Id);
        insert biCase;
        return biCase;
    }

    @IsTest
    static void surescriptsWithActiveHipaa_allows() {
        Case biCase = createBiCase(true);
        CS_eBVHipaaValidator.vendorOverride = CS_eBVHipaaValidator.VENDOR_SURESCRIPTS;

        Test.startTest();
        CS_eBVHipaaValidator.ValidationResult result = CS_eBVHipaaValidator.validateHipaaForEBV(biCase.Id);
        Test.stopTest();

        Assert.isTrue(result.isValid);
        Assert.isNull(result.errorMessage);
    }

    @IsTest
    static void surescriptsWithoutActiveHipaa_blocks() {
        Case biCase = createBiCase(false);
        CS_eBVHipaaValidator.vendorOverride = CS_eBVHipaaValidator.VENDOR_SURESCRIPTS;

        Test.startTest();
        CS_eBVHipaaValidator.ValidationResult result = CS_eBVHipaaValidator.validateHipaaForEBV(biCase.Id);
        Test.stopTest();

        Assert.isFalse(result.isValid);
        Assert.areEqual(System.Label.CS_eBV_HIPAA_Not_Active, result.errorMessage);
    }

    @IsTest
    static void otherVendorWithActiveHipaa_allows() {
        Case biCase = createBiCase(true);
        CS_eBVHipaaValidator.vendorOverride = 'OtherVendor';

        Test.startTest();
        CS_eBVHipaaValidator.ValidationResult result = CS_eBVHipaaValidator.validateHipaaForEBV(biCase.Id);
        Test.stopTest();

        Assert.isTrue(result.isValid);
    }

    @IsTest
    static void otherVendorWithoutActiveHipaa_allows() {
        Case biCase = createBiCase(false);
        CS_eBVHipaaValidator.vendorOverride = 'OtherVendor';

        Test.startTest();
        CS_eBVHipaaValidator.ValidationResult result = CS_eBVHipaaValidator.validateHipaaForEBV(biCase.Id);
        Test.stopTest();

        Assert.isTrue(result.isValid);
    }

    @IsTest
    static void nullCaseId_throws() {
        try {
            CS_eBVHipaaValidator.validateHipaaForEBV(null);
            Assert.fail('Expected AuraHandledException');
        } catch (AuraHandledException e) {
            Assert.isNotNull(e);
        }
    }
}
