import { Component, OnInit } from '@angular/core';
   import { CommonModule } from '@angular/common';
   import { FormsModule } from '@angular/forms';
   import { ItemService, Item, SVConfig } from './item.service';
   import { HttpClientModule } from '@angular/common/http';

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
          } else if ('errors' in response) {
            this.configStatus = 'Errors: ' + response.errors.join(', ');
          }
        },
        error: (err) => {
          console.error('Verify config error:', err);
          this.configStatus = 'Verification failed: ' + err.message;
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
           } else if ('error' in response) {
             this.simulationStatus = 'Error: ' + response.error;
           }
         },
         error: (err) => {
           console.error('Start simulation error:', err);
           this.simulationStatus = 'Simulation failed: ' + err.message;
         }
       });
     }
   }