# AWS Amplify Configuration Guide

##  Environment Variables Setup

### Required Variables:
```
RIOT_API_KEY=RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ACCESS_KEY_ID=AKIAxxxxxxxxxxxxxxxxx
SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REGION=us-east-1
```

##  Step-by-Step Instructions:

### 1. Access Amplify Console
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app: **lolforge**
3. Click on **App settings** → **Environment variables**

### 2. Add Variables ONE BY ONE
⚠️ **IMPORTANT**: Add each variable separately, don't copy-paste all at once

Click **Manage variables** and add:

**Variable 1:**
```
Key: RIOT_API_KEY
Value: RGAPI-your-key-here
```

**Variable 2:**
```
Key: ACCESS_KEY_ID
Value: Your-AWS-Access-Key
```

**Variable 3:**
```
Key: SECRET_ACCESS_KEY
Value: Your-AWS-Secret-Key
```

**Variable 4:**
```
Key: REGION
Value: us-east-1
```

### 3. Verify Variables
After adding all variables, they should look like this in the console:
```
RIOT_API_KEY        RGAPI-••••••••••••••••
ACCESS_KEY_ID       AKIA••••••••••••••••••
SECRET_ACCESS_KEY   ••••••••••••••••••••••
REGION              us-east-1
```

### 4. Redeploy
1. Go to **Main** branch
2. Click **Redeploy this version**
3. Wait for deployment to complete (~3-5 minutes)