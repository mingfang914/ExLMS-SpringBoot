package project.TeamFive.ExLMS.forum.util;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class TagUtils {

    /**
     * Parse comma-separated tag string into a list of normalized names.
     * Max 3 tags, normalized to lowercase and trimmed.
     */
    public static List<String> parseTags(String tagsString) {
        if (tagsString == null || tagsString.trim().isEmpty()) {
            return List.of();
        }
        
        return Arrays.stream(tagsString.split(","))
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .map(String::toLowerCase)
                .distinct()
                .limit(3)
                .collect(Collectors.toList());
    }

    /**
     * Transform a name to a slug (simple version).
     */
    public static String toSlug(String name) {
        if (name == null) return null;
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-");
    }
}
