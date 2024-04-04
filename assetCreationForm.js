// assetCreationForm.js
import { LightningElement, track,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createAsset from '@salesforce/apex/AssetCreationController.createAsset';
import { getBarcodeScanner } from 'lightning/mobileCapabilities';

const BUSINESS_UNIT_OPTIONS = [
    { label: 'Appliances', value: 'Appliances' },
    { label: 'Locks', value: 'Locks' },
    { label: 'Storage', value: 'Storage' },
    { label: 'Interio', value: 'Interio' }
];

export default class AssetCreationForm extends LightningElement {

    @api recordId
    @track assetName;
    @track assetDescription;
    @track assetBusinessUnit;
    @track competitorBusinessUnit;
    @track brandName;
    @track assetType;
    @track capacity;
    @track ageOfProduct;
    @track manufacturingDate;
    @track serialNumber;
    @track showCompetitorForm = false;
    @track showScannerButton = false;
    @track serialIdScanned = false; // Flag to track whether the serial ID value has been scanned
    @track productValue;
    businessUnitOptions = BUSINESS_UNIT_OPTIONS;
    barcodeScanner;

    handleProductChange(event){
        this.productValue = event.target.value;
    }

    handleCheckboxChange(event) {
        this.showCompetitorForm = event.target.checked;
    }

    handleAssetNameChange(event) {
        this.assetName = event.target.value;
    }

    handleDescriptionChange(event) {
        this.assetDescription = event.target.value;
    }

    handleAssetBusinessUnitChange(event) {
        this.assetBusinessUnit = event.target.value;
        this.updateScannerButtonVisibility();
    }

    handleCompetitorBusinessUnitChange(event) {
        this.competitorBusinessUnit = event.target.value;
    }

    handleBrandNameChange(event) {
        this.brandName = event.target.value;
    }

    handleAssetTypeChange(event) {
        this.assetType = event.target.value;
    }

    handleCapacityChange(event) {
        this.capacity = event.target.value;
    }

    handleAgeOfProductChange(event) {
        this.ageOfProduct = event.target.value;
    }

    handleManufacturingDateChange(event) {
        this.manufacturingDate = event.target.value;
    }

    handleSerialNumberChange(event) {
        // Set the scanned value to the serial number field
        this.serialNumber = event.target.value;
    }

    connectedCallback() {
        this.barcodeScanner = getBarcodeScanner();
    }

    createAsset() {
        createAsset({
            assetName: this.assetName,
            assetDescription: this.assetDescription,
            assetBusinessUnit: this.showCompetitorForm ? this.competitorBusinessUnit : this.assetBusinessUnit,
            isCompetitor: this.showCompetitorForm,
            brandName: this.brandName,
            assetType: this.assetType,
            capacity: this.capacity,
            ageOfProduct: this.ageOfProduct,
            manufacturingDate: this.manufacturingDate,
            serialNumber: this.serialNumber,
            recordId: this.recordId,
            productId:this.productValue
        })
        .then(() => {
            this.resetForm();
            this.showToast('Success', 'Asset record created successfully', 'success');
        })
        .catch(error => {
            console.error('Error creating asset:', error);
            this.showToast('Error', 'Failed to create asset: ' + error.body.message, 'error');
        });
    }

    resetForm() {
        this.assetName = '';
        this.assetDescription = '';
        this.assetBusinessUnit = '';
        this.competitorBusinessUnit = '';
        this.brandName = '';
        this.assetType = '';
        this.capacity = null;
        this.ageOfProduct = null;
        this.manufacturingDate = null;
        this.serialNumber = '';
        this.showCompetitorForm = false;
        this.showScannerButton = false; // Reset scanner button visibility
        this.serialIdScanned = false;
        this.productValue =''; // Reset the flag indicating whether the serial ID value has been scanned
    }

    openScanner() {
        // Logic to open barcode and QR code scanner
        console.log('Opening scanner...');
        if (this.barcodeScanner.isAvailable()) {
            let scanningOptions = {
                "barcodeTypes": ["code128","code39", "code93", "ean13", "ean8", "upca", "upce", "qr", "datamatrix", "itf", "pdf417"], 
                "instructionText":"Position barcode in the scanner view.\nPress x to stop.",
                "successText":"Successful Scan!"
            };
            this.barcodeScanner.scan(scanningOptions)
                .then((results) => {
                    // Do something with the results of the scan
                    this.serialNumber = results[0].value;
                    this.serialIdScanned = true; // Set the flag to true after successful scanning
                })
                .catch((error) => {
                    // Handle cancellation and scanning errors here
                    this.showToast('Error', error.body.message, 'error');
                })
                .finally(() => {
                    this.barcodeScanner.dismiss();
                });
        } else {
            this.showToast('Error', 'Barcode scanner is not available', 'error');
        }
    }

    updateScannerButtonVisibility() {
        this.showScannerButton = this.assetBusinessUnit === 'Appliances' || this.assetBusinessUnit === 'Locks';
    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }
}
