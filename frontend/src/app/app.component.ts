import { Component, OnInit } from '@angular/core';
   import { CommonModule } from '@angular/common';
   import { FormsModule } from '@angular/forms';
   import { ItemService, Item, SVConfig } from './item.service';
   import { HttpClientModule } from '@angular/common/http';
   import { HttpClient, HttpErrorResponse } from '@angular/common/http';

   @Component({
     selector: 'app-root',
     standalone: true,
     imports: [CommonModule, FormsModule, HttpClientModule],
     templateUrl: './app.component.html',
     styleUrls: ['./app.component.css']
   })
   export class AppComponent implements OnInit {
     title = 'IEC 61850 SV Simulator';
     items: Item[] = [];
     config: SVConfig = {
       appID: '',
       macAddress: '',
       GOid: '',
       interface: '',
       cbref: '',
       svid: '',
       scenariofile: ''
     };
     configStatus: string = '';
     simulationStatus: string = '';
     isConfigValid: boolean = false; //  flag to control Start Simulation button

     constructor(private itemService: ItemService) {}

     ngOnInit() {
       this.itemService.getItems().subscribe(data => {
         this.items = data;
       });
     }
   startConfig() {
    console.log('Sending config:', this.config);
    this.configStatus = 'Verifying...';
    this.itemService.verifyConfig(this.config).subscribe({
      next: (response: any) => {
        if ('message' in response) {
          this.configStatus = response.message;
          this.isConfigValid = response.message === 'Configuration is valid';
          if (this.isConfigValid) {
            // Clear configStatus after 20 seconds
            setTimeout(() => {
              this.configStatus = '';
            }, 10000);
          }
        } else if ('errors' in response) {
          this.configStatus = 'Errors: ' + response.errors.join(', ');
          this.isConfigValid = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Verify config error:', err);
        const errorMessage = err.error?.errors?.join(', ') || err.message;
        this.configStatus = 'Verification failed: ' + errorMessage;
        this.isConfigValid = false;
      }
    });
  }
  startSimulation() {
    console.log('Starting simulation with config:', this.config);
    this.simulationStatus = 'Starting simulation...';
    this.itemService.startSimulation(this.config).subscribe({
      next: (response: any) => {
        console.log('Start simulation response:', response);
        if ('message' in response) {
          this.simulationStatus = response.message;
          // Clear simulationStatus after 20 seconds
          setTimeout(() => {
            this.simulationStatus = '';
          }, 20000);
        } else if ('error' in response) {
          this.simulationStatus = 'Error: ' + response.error;
          // Clear simulationStatus after 20 seconds
          setTimeout(() => {
            this.simulationStatus = '';
          }, 20000);
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Start simulation error:', err);
        const errorMessage = err.error?.error || err.message;
        this.simulationStatus = 'Simulation failed: ' + errorMessage;
        // Clear simulationStatus after 20 seconds
        setTimeout(() => {
          this.simulationStatus = '';
        }, 20000);
      }
    });
  }
   }