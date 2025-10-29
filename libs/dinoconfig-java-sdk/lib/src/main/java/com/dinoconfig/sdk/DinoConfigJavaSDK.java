package com.dinoconfig.sdk;

/**
 * Main entry point for the DinoConfig Java SDK.
 * This class provides access to all public SDK components.
 */
public class DinoConfigJavaSDK {
    
    // Private constructor to prevent instantiation
    private DinoConfigJavaSDK() {}
    
    /**
     * Get the SDK version
     * @return The SDK version string
     */
    public static String getVersion() {
        return "1.0.0";
    }
    
    /**
     * Get the SDK name
     * @return The SDK name
     */
    public static String getName() {
        return "DinoConfig Java SDK";
    }
}
