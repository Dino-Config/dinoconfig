/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk;

/**
 * Main entry point class for the DinoConfig Java SDK.
 *
 * <p>This class provides static utility methods for SDK information.
 * For creating SDK instances, use {@link DinoConfigSDKFactory}.
 *
 * <p><b>SDK Information:</b>
 * <pre>{@code
 * System.out.println("SDK Name: " + DinoConfigJavaSDK.getName());
 * System.out.println("SDK Version: " + DinoConfigJavaSDK.getVersion());
 * }</pre>
 *
 * <p><b>Quick Start:</b>
 * <pre>{@code
 * import com.dinoconfig.sdk.DinoConfigSDKFactory;
 * import com.dinoconfig.sdk.DinoConfigSDK;
 * import com.dinoconfig.sdk.api.ConfigAPI;
 * import com.dinoconfig.sdk.api.DiscoveryAPI;
 * import com.dinoconfig.sdk.model.*;
 *
 * // Initialize the SDK
 * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key");
 *
 * // Get entire configuration
 * ConfigAPI configAPI = dinoconfig.getConfigAPI();
 * ApiResponse<ConfigData> config = configAPI.get("MyBrand", "AppSettings");
 * System.out.println("Values: " + config.getData().getValues());
 *
 * // Get single value using path shorthand
 * ApiResponse<Object> response = configAPI.getValue("MyBrand.AppSettings.theme");
 * System.out.println("Theme: " + response.getData());
 *
 * // Discovery API
 * DiscoveryAPI discoveryAPI = dinoconfig.getDiscoveryAPI();
 * ApiResponse<List<BrandInfo>> brands = discoveryAPI.listBrands();
 * ApiResponse<IntrospectionResult> introspection = discoveryAPI.introspect();
 * }</pre>
 *
 * @author DinoConfig Team
 * @version 1.1.0
 * @since 1.0.0
 * @see DinoConfigSDKFactory
 * @see DinoConfigSDK
 */
public final class DinoConfigJavaSDK {

    /** SDK version constant */
    private static final String VERSION = "1.1.0";

    /** SDK name constant */
    private static final String NAME = "DinoConfig Java SDK";

    /**
     * Private constructor to prevent instantiation.
     * This is a utility class with only static methods.
     */
    private DinoConfigJavaSDK() {
        throw new UnsupportedOperationException(
                "DinoConfigJavaSDK is a utility class and cannot be instantiated"
        );
    }

    /**
     * Returns the SDK version.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * String version = DinoConfigJavaSDK.getVersion();
     * System.out.println("Using DinoConfig Java SDK v" + version);
     * // Output: Using DinoConfig Java SDK v1.1.0
     * }</pre>
     *
     * @return The SDK version string (e.g., "1.1.0")
     */
    public static String getVersion() {
        return VERSION;
    }

    /**
     * Returns the SDK name.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * String name = DinoConfigJavaSDK.getName();
     * System.out.println(name);
     * // Output: DinoConfig Java SDK
     * }</pre>
     *
     * @return The SDK name
     */
    public static String getName() {
        return NAME;
    }

    /**
     * Returns a formatted string with SDK name and version.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * System.out.println(DinoConfigJavaSDK.getFullName());
     * // Output: DinoConfig Java SDK v1.1.0
     * }</pre>
     *
     * @return Formatted SDK identifier
     */
    public static String getFullName() {
        return NAME + " v" + VERSION;
    }
}
