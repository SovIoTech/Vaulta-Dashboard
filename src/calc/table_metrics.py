#!/usr/bin/env python3
"""
DynamoDB Data Verification Script - Fixed Version

This script verifies that data is being properly stored in the optimized
DynamoDB table with all required attributes.
"""

import boto3
import time
from datetime import datetime
import argparse
import json
from decimal import Decimal

# Set up command line arguments
parser = argparse.ArgumentParser(description='Verify DynamoDB data structure')
parser.add_argument('--battery-id', type=str, default='BAT-0x440',
                    help='Battery ID to check (default: BAT-0x440)')
parser.add_argument('--region', type=str, default='ap-southeast-2',
                    help='AWS region (default: ap-southeast-2)')
parser.add_argument('--table', type=str, default='CAN_BMS_Data_Optimized',
                    help='DynamoDB table name')
parser.add_argument('--limit', type=int, default=5,
                    help='Number of items to check (default: 5)')
parser.add_argument('--time-window', type=int, default=3600,
                    help='Time window in seconds to check (default: 1 hour)')
parser.add_argument('--check-gsi', action='store_true',
                    help='Check if GSIs are being populated')
args = parser.parse_args()

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb', region_name=args.region)
table = dynamodb.Table(args.table)

def decimal_to_str(obj):
    """Helper function to safely convert Decimal to string"""
    if isinstance(obj, Decimal):
        return str(obj)
    return obj

def check_latest_items(battery_id):
    """Check the latest items for a specific battery ID"""
    print(f"\n===== Checking Latest Items for {battery_id} =====")
    
    # Calculate timestamp range (default: last hour)
    end_time = int(time.time())
    start_time = end_time - args.time_window
    
    # Query for recent data
    try:
        response = table.query(
            KeyConditionExpression="TagID = :tid AND #ts > :start_time",
            ExpressionAttributeNames={"#ts": "Timestamp"},
            ExpressionAttributeValues={
                ":tid": battery_id,
                ":start_time": start_time
            },
            Limit=args.limit,
            ScanIndexForward=False  # Get newest first
        )
        
        if not response.get('Items'):
            print(f"No recent data found for {battery_id} in the last {args.time_window} seconds")
            return False
        
        print(f"Found {len(response['Items'])} recent items")
        
        # Check each item
        for i, item in enumerate(response['Items']):
            print(f"\nItem {i+1}:")
            
            # Convert timestamp - safely handle Decimal
            timestamp = item.get('Timestamp')
            if timestamp is not None:
                if isinstance(timestamp, Decimal):
                    timestamp = int(timestamp)
                dt = datetime.fromtimestamp(timestamp)
                print(f"  Timestamp: {timestamp} ({dt})")
            else:
                print("  Timestamp: Not found")
            
            # Check required attributes
            required_attrs = [
                'TagID', 'Timestamp', 'LATEST', 
                'TagID_TimeWindow_HOUR', 'TagID_TimeWindow_DAY', 'TagID_TimeWindow_MONTH'
            ]
            
            missing_attrs = [attr for attr in required_attrs if attr not in item]
            if missing_attrs:
                print(f"  WARNING: Missing required attributes: {', '.join(missing_attrs)}")
            else:
                print("  ✓ All required time bucket attributes present")
            
            # Check time bucket formats
            if 'TagID_TimeWindow_HOUR' in item:
                hour_bucket = item['TagID_TimeWindow_HOUR']
                if f"{battery_id}#HOUR_" in hour_bucket:
                    print(f"  ✓ Hour bucket format correct: {hour_bucket}")
                else:
                    print(f"  WARNING: Unexpected hour bucket format: {hour_bucket}")
            
            if 'TagID_TimeWindow_DAY' in item:
                day_bucket = item['TagID_TimeWindow_DAY']
                if f"{battery_id}#DAY_" in day_bucket:
                    print(f"  ✓ Day bucket format correct: {day_bucket}")
                else:
                    print(f"  WARNING: Unexpected day bucket format: {day_bucket}")
                    
            if 'TagID_TimeWindow_MONTH' in item:
                month_bucket = item['TagID_TimeWindow_MONTH']
                if f"{battery_id}#MONTH_" in month_bucket:
                    print(f"  ✓ Month bucket format correct: {month_bucket}")
                else:
                    print(f"  WARNING: Unexpected month bucket format: {month_bucket}")
            
            # Show a sample of other attributes (up to 5)
            other_attrs = [k for k in item.keys() if k not in required_attrs]
            if other_attrs:
                sample_attrs = other_attrs[:5]
                print(f"  Data attributes sample ({len(other_attrs)} total):")
                for attr in sample_attrs:
                    value = decimal_to_str(item[attr])
                    print(f"    - {attr}: {value}")
        
        return True
    
    except Exception as e:
        print(f"Error querying table: {e}")
        return False

def check_gsi_data():
    """Check if Global Secondary Indexes are populated"""
    if not args.check_gsi:
        return
    
    print("\n===== Checking Global Secondary Indexes =====")
    
    # Check Latest Data Index
    try:
        print("\nQuerying LatestDataIndex...")
        response = table.query(
            IndexName="LatestDataIndex",
            KeyConditionExpression="LATEST = :latest",
            ExpressionAttributeValues={
                ":latest": "LATEST"
            },
            Limit=3,
            ScanIndexForward=False  # Get newest first
        )
        
        if not response.get('Items'):
            print("No data found in LatestDataIndex")
        else:
            print(f"Found {len(response['Items'])} items in LatestDataIndex")
            print("Latest items:")
            for i, item in enumerate(response['Items']):
                timestamp = item.get('Timestamp')
                if timestamp is not None:
                    if isinstance(timestamp, Decimal):
                        timestamp = int(timestamp)
                    dt = datetime.fromtimestamp(timestamp)
                    print(f"  {i+1}. {item.get('TagID')} at {dt}")
                else:
                    print(f"  {i+1}. {item.get('TagID')} - timestamp not found")
    
    except Exception as e:
        print(f"Error querying LatestDataIndex: {e}")
    
    # Check Day Bucket Index with current day
    try:
        today = datetime.now().strftime('%Y%m%d')
        day_bucket = f"{args.battery_id}#DAY_{today}"
        
        print(f"\nQuerying DailyBucketIndex for today ({day_bucket})...")
        response = table.query(
            IndexName="DailyBucketIndex",
            KeyConditionExpression="TagID_TimeWindow_DAY = :bucket",
            ExpressionAttributeValues={
                ":bucket": day_bucket
            },
            Limit=3
        )
        
        if not response.get('Items'):
            print(f"No data found in DailyBucketIndex for today")
        else:
            print(f"Found {len(response['Items'])} items in DailyBucketIndex for today")
            print("Sample items:")
            for i, item in enumerate(response['Items']):
                timestamp = item.get('Timestamp')
                if timestamp is not None:
                    if isinstance(timestamp, Decimal):
                        timestamp = int(timestamp)
                    dt = datetime.fromtimestamp(timestamp)
                    print(f"  {i+1}. {item.get('TagID')} at {dt}")
                else:
                    print(f"  {i+1}. {item.get('TagID')} - timestamp not found")
    
    except Exception as e:
        print(f"Error querying DailyBucketIndex: {e}")

def main():
    """Main function"""
    print(f"DynamoDB Data Verification for {args.table}")
    print(f"Checking battery: {args.battery_id}")
    print(f"Time window: {args.time_window} seconds")
    print(f"Max items to check: {args.limit}")
    
    # Check latest items
    check_latest_items(args.battery_id)
    
    # Check GSIs if requested
    check_gsi_data()
    
    print("\nVerification complete!")

if __name__ == "__main__":
    main()